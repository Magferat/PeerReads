const BorrowRequest = require('../models/BorrowRequest');
const Book = require('../models/Book');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
// const haversineDistance = require("../utils/distance");
// const axios = require("axios");
const { deliveryEstimate, calcPlatformFee } = require('../utils/fees');

const { haversineDistance } = require("../utils/distance");

exports.createRequest = async (req, res) => {
    const { bookId, message } = req.body;
    const book = await Book.findById(bookId).populate("owner");
    if (!book || book.status !== "Available")
        return res.status(400).json({ message: "Book not available" });

    if (String(book.owner._id) === String(req.user._id))
        return res.status(400).json({ message: "Cannot request your own book" });

    const exists = await BorrowRequest.findOne({
        book: book._id,
        borrower: req.user._id,
        status: { $in: ["Pending", "Approved"] }
    });
    if (exists) return res.status(400).json({ message: "Already requested this book" });

    const borrower = await User.findById(req.user._id);
    const lender = await User.findById(book.owner._id);

    let distanceKm = null;
    if (borrower.location?.coords && lender.location?.coords) {
        distanceKm = haversineDistance(borrower.location.coords, lender.location.coords);
    }
    // console.log()

    const br = await BorrowRequest.create({
        book: book._id,
        lender: book.owner._id,
        borrower: req.user._id,
        borrower_adr: borrower.location.address,
        lender_adr: lender.location.address,
        originalPrice: book.originalPrice,
        distance: distanceKm ? `${distanceKm.toFixed(2)} km` : null,
        message
    });

    await Notification.create({
        user: book.owner._id,
        type: "BorrowRequest",
        message: `New request for "${book.title}"`
    });

    res.json(br);
};






exports.lenderApprove = async (req, res) => {
    const { requestId, pickupAt } = req.body;

    const reqDoc = await BorrowRequest.findById(requestId).populate('book');

    if (!reqDoc || String(reqDoc.lender) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });

    if (reqDoc.status !== "Pending")
        return res.status(400).json({ message: "Already processed" });

    reqDoc.status = "Approved";   // only approval
    reqDoc.approvedAt = new Date();
    reqDoc.pickupAt = pickupAt;
    await reqDoc.save();


    // Update book status (optional: Pre-Delivery so others can’t request)
    reqDoc.book.status = "Pre-Delivery";
    await reqDoc.book.save();

    // Notify borrower
    await Notification.create({
        user: reqDoc.borrower,
        type: "Approved",
        message: `Your request for "${reqDoc.book.title}" was approved. Pickup scheduled.`
    });


    res.json({ message: "Request approved (waiting for borrower to proceed)" });
};


exports.borrowerProceed = async (req, res) => {
    const { requestId } = req.body;

    const reqDoc = await BorrowRequest.findById(requestId).populate('book');
    if (!reqDoc || String(reqDoc.borrower) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });

    if (reqDoc.status !== "Approved")
        return res.status(400).json({ message: "Not yet approved by lender" });

    const borrower = await User.findById(reqDoc.borrower);
    const lender = await User.findById(reqDoc.lender);
    const book = reqDoc.book;

    const estDelivery = deliveryEstimate();
    const platformFee = calcPlatformFee(book.originalPrice);
    const needed = book.originalPrice + estDelivery + platformFee;

    if (borrower.balance < needed)
        return res.status(400).json({ message: "Insufficient balance. Please recharge." });

    // Lock deposit
    const depositHold = book.originalPrice + estDelivery;
    borrower.balance -= depositHold;
    borrower.lockedBalance += depositHold;
    await borrower.save();

    // Create Loan record
    await Loan.create({
        book: book._id,
        lender: lender._id,
        borrower: borrower._id,
        depositHold,
        deliveryEstimate: estDelivery,
        platformFee,
        lendingFee: book.lendingFee,
        delivery: {
            pickupAt: reqDoc.pickupAt,
            status: "Pre-Delivery",
            timeline: [{ status: "Pre-Delivery" }]
        }
    });

    // Notify lender
    await Notification.create({
        user: lender._id,
        type: "Proceed",
        message: `Borrower has confirmed & deposit locked for "${book.title}".`
    });

    // ✅ Delete the request after proceeding
    await BorrowRequest.findByIdAndDelete(requestId);

    res.json({ message: "Proceed successful, deposit locked" });
};



exports.borrowerDecline = async (req, res) => {
    const { requestId } = req.body;

    const reqDoc = await BorrowRequest.findById(requestId).populate('book');
    if (!reqDoc || String(reqDoc.borrower) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });

    if (reqDoc.status !== "Approved")
        return res.status(400).json({ message: "Can only decline after approval" });

    // Reset book to Available
    reqDoc.book.status = "Available";
    await reqDoc.book.save();

    // Notify lender
    await Notification.create({
        user: reqDoc.lender,
        type: "Declined",
        message: `Borrower declined your approval for "${reqDoc.book.title}".`
    });

    await BorrowRequest.findByIdAndDelete(requestId);

    res.json({ message: "Request declined, book re-available" });
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
        const requests = await BorrowRequest.find({
            borrower: req.user._id,
            status: { $nin: ['Rejected', 'Cancelled', 'Declined', 'On Proceed'] }

        })
            .populate('book', 'title author coverImage lendingFee')
            .populate('lender', 'name')
            .sort({ createdAt: -1 });

        res.json(requests);
        console.log(requests);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lender: see requests for my books
exports.requestsForMe = async (req, res) => {
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

