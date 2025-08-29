const BorrowRequest = require('../models/BorrowRequest');
const Book = require('../models/Book');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const haversineDistance = require("../utils/distance");
const axios = require("axios");
const { deliveryEstimate, calcPlatformFee } = require('../utils/fees');


// exports.getIncoming = async (req, res) => {
//     const requests = await BorrowRequest.find({ lender: req.user._id })
//         .populate("book")
//         .populate("borrower", "name location")
//         .lean();

//     // Add distance if borrower has coords
//     requests.forEach((r) => {
//         if (
//             r.borrower?.location?.coordinates &&
//             req.user?.location?.coordinates
//         ) {
//             const { lat: lat1, lng: lon1 } = req.user.location.coordinates;
//             const { lat: lat2, lng: lon2 } = r.borrower.location.coordinates;
//             r.distance = haversineDistance(lat1, lon1, lat2, lon2).toFixed(1);
//         }
//     });

//     res.json(requests);
// };




exports.createRequest = async (req, res) => {
    const { bookId, message } = req.body;
    const book = await Book.findById(bookId).populate("owner");
    if (!book || book.status !== "Available")
        return res.status(400).json({ message: "Book not available" });

    if (String(book.owner._id) === String(req.user._id))
        return res.status(400).json({ message: "Cannot request your own book" });

    // Prevent duplicate request
    const exists = await BorrowRequest.findOne({
        book: book._id,
        borrower: req.user._id,
        status: { $in: ["Pending", "Approved"] }
    });
    if (exists) return res.status(400).json({ message: "Already requested this book" });

    // borrower & lender
    const borrower = await User.findById(req.user._id);
    const lender = await User.findById(book.owner._id);

    let distanceText = null, durationText = null;

    if (borrower.location?.coords && lender.location?.coords) {
        try {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${borrower.location.coords.lat},${borrower.location.coords.lng}&destinations=${lender.location.coords.lat},${lender.location.coords.lng}&key=${apiKey}`;

            const { data } = await axios.get(url);
            const element = data.rows[0].elements[0];
            if (element.status === "OK") {
                distanceText = element.distance.text; // e.g. "5.4 km"
                durationText = element.duration.text; // e.g. "12 mins"
            }
            // console.log(distance);
        } catch (err) {
            console.error("Distance fetch failed:", err.message);
        }
    }

    const br = await BorrowRequest.create({
        book: book._id,
        lender: book.owner._id,
        borrower: req.user._id,
        originalPrice: book.originalPrice,
        distance: distanceText,
        duration: durationText,
        message
    });

    await Notification.create({
        user: book.owner._id,
        type: "BorrowRequest",
        message: `New request for "${book.title}"`
    });

    res.json(br);
};

// exports.createRequest = async (req, res) => {
//     const { bookId, message } = req.body;
//     const book = await Book.findById(bookId);
//     if (!book || book.status !== 'Available')
//         return res.status(400).json({ message: 'Book not available' });

//     if (String(book.owner) === String(req.user._id))
//         return res.status(400).json({ message: 'Cannot request your own book' });

//     // Prevent duplicate request
//     const exists = await BorrowRequest.findOne({
//         book: book._id,
//         borrower: req.user._id,
//         status: { $in: ['Pending', 'Approved'] }
//     });
//     if (exists) return res.status(400).json({ message: 'Already requested this book' });

//     const br = await BorrowRequest.create({
//         book: book._id,
//         lender: book.owner,
//         borrower: req.user._id,
//         originalPrice: book.originalPrice,
//         message


//     });

//     await Notification.create({
//         user: book.owner,
//         type: 'BorrowRequest',
//         message: `New request for "${book.title}"`
//     });

//     res.json(br);
// };


exports.lenderApprove = async (req, res) => {
    const { requestId, pickupAt } = req.body;
    const reqDoc = await BorrowRequest.findById(requestId).populate('book');
    if (!reqDoc || String(reqDoc.lender) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    if (reqDoc.status !== 'Pending') return res.status(400).json({ message: 'Already processed' });
    // console.log(reqDoc);

    const borrower = await User.findById(reqDoc.borrower);
    const lender = await User.findById(reqDoc.lender);
    const book = reqDoc.book;

    const estDelivery = deliveryEstimate();
    const platformFee = calcPlatformFee(book.originalPrice);
    const needed = book.originalPrice + estDelivery + platformFee;

    if (borrower.balance < needed) return res.status(400).json({ message: 'Insufficient balance (needs price + delivery + platform fee)' });

    // Hold deposit: price + one-way delivery
    const depositHold = book.originalPrice + estDelivery;
    borrower.balance -= depositHold;
    borrower.lockedBalance += depositHold;
    await borrower.save();

    const loan = await Loan.create({
        book: book._id,
        lender: lender._id,
        borrower: borrower._id,
        depositHold,
        deliveryEstimate: estDelivery,
        platformFee,
        lendingFee: book.lendingFee,
        delivery: { pickupAt, status: 'Pre-Delivery', timeline: [{ status: 'Pre-Delivery' }] }
    });

    // Instead of deducting deposit here, just approve request + set Pre-Delivery
    reqDoc.status = 'Approved';
    reqDoc.approvedAt = new Date();
    await reqDoc.save();

    book.status = 'Pre-Delivery';
    await book.save();

    await Notification.create({
        user: borrower._id,
        type: 'Approved',
        message: `Your request for "${book.title}" was approved. Pickup scheduled.`
    });
    res.json({ message: 'Approved' });

};

exports.lenderReject = async (req, res) => {
    const { requestId } = req.body;
    const reqDoc = await BorrowRequest.findById(requestId);
    if (!reqDoc || String(reqDoc.lender) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    reqDoc.status = 'Rejected';
    await reqDoc.save();
    await Notification.create({ user: reqDoc.borrower, type: 'Rejected', message: 'Borrow request rejected.' });
    res.json({ message: 'Rejected' });

};

// Borrower: see my own requests
exports.myRequests = async (req, res) => {
    try {
        const requests = await BorrowRequest.find({ borrower: req.user._id })
            .populate('book', 'title author coverImage lendingFee')
            .populate('lender', 'name')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lender: see requests for my books
exports.requestsForMe = async (req, res) => {
    console.log("hereeeeeeeeeeeeee ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", req.user)
    try {

        const requests = await BorrowRequest.find({
            lender: req.user._id,
            status: { $nin: ['Rejected', 'Cancelled'] }
        }).populate('book', 'title author coverImage lendingFee').populate('borrower', 'name').sort({ createdAt: -1 });


        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// requestController.js
exports.cancelRequest = async (req, res) => {
    const { requestId } = req.body;

    // Find the request
    const reqDoc = await BorrowRequest.findById(requestId);

    // Check if request exists and belongs to the user
    if (!reqDoc || String(reqDoc.borrower) !== String(req.user._id)) {
        return res.status(403).json({ message: "Not allowed" });
    }

    // Check if it's still pending
    if (reqDoc.status !== "Pending") {
        return res.status(400).json({ message: "Only pending requests can be cancelled" });
    }

    // DELETE the request instead of updating status
    await BorrowRequest.findByIdAndDelete(requestId);

    res.json({ message: "Request cancelled and deleted successfully" });
};

// ===

// requestController.js
exports.borrowerProceed = async (req, res) => {
    const { requestId } = req.body;
    const reqDoc = await BorrowRequest.findById(requestId).populate('book');
    if (!reqDoc || String(reqDoc.borrower) !== String(req.user._id)) {
        return res.status(403).json({ message: "Not allowed" });
    }
    if (reqDoc.status !== "Approved") {
        return res.status(400).json({ message: "Request not approved yet" });
    }

    const borrower = await User.findById(req.user._id);
    const lender = await User.findById(reqDoc.lender);
    const book = reqDoc.book;

    const estDelivery = deliveryEstimate();
    const platformFee = calcPlatformFee(book.originalPrice);
    const needed = book.originalPrice + estDelivery + platformFee;

    if (borrower.balance < needed) {
        return res.status(400).json({ message: "Insufficient balance. Please recharge." });
    }

    // Hold deposit
    const depositHold = book.originalPrice + estDelivery;
    borrower.balance -= depositHold;
    borrower.lockedBalance += depositHold;
    await borrower.save();

    const loan = await Loan.create({
        book: book._id,
        lender: lender._id,
        borrower: borrower._id,
        depositHold,
        deliveryEstimate: estDelivery,
        platformFee,
        lendingFee: book.lendingFee,
        delivery: { status: 'Pre-Delivery', timeline: [{ status: 'Pre-Delivery' }] }
    });

    book.status = "Pre-Delivery";
    await book.save();

    res.json({ message: "Proceed success", loanId: loan._id });
};

exports.borrowerDecline = async (req, res) => {
    const { requestId } = req.body;
    const reqDoc = await BorrowRequest.findById(requestId).populate('book');
    if (!reqDoc || String(reqDoc.borrower) !== String(req.user._id)) {
        return res.status(403).json({ message: "Not allowed" });
    }
    if (reqDoc.status !== "Approved") {
        return res.status(400).json({ message: "Not approved" });
    }
    reqDoc.status = "Cancelled";
    await reqDoc.save();

    reqDoc.book.status = "Available";
    await reqDoc.book.save();

    res.json({ message: "Declined" });
};
