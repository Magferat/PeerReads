const BorrowRequest = require('../models/BorrowRequest');
const Book = require('../models/Book');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const { deliveryEstimate, calcPlatformFee } = require('../utils/fees');


exports.createRequest = async (req, res) => {
    const { bookId, message } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.status !== 'Available')
        return res.status(400).json({ message: 'Book not available' });

    if (String(book.owner) === String(req.user._id))
        return res.status(400).json({ message: 'Cannot request your own book' });

    // Prevent duplicate request
    const exists = await BorrowRequest.findOne({
        book: book._id,
        borrower: req.user._id,
        status: { $in: ['Pending', 'Approved'] }
    });
    if (exists) return res.status(400).json({ message: 'Already requested this book' });

    const br = await BorrowRequest.create({
        book: book._id,
        lender: book.owner,
        borrower: req.user._id,
        message
    });

    await Notification.create({
        user: book.owner,
        type: 'BorrowRequest',
        message: `New request for "${book.title}"`
    });

    res.json(br);
};


exports.lenderApprove = async (req, res) => {
    const { requestId, pickupAt } = req.body;
    const reqDoc = await BorrowRequest.findById(requestId).populate('book');
    if (!reqDoc || String(reqDoc.lender) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    if (reqDoc.status !== 'Pending') return res.status(400).json({ message: 'Already processed' });

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

    reqDoc.status = 'Approved';
    reqDoc.approvedAt = new Date();
    await reqDoc.save();

    book.status = 'Pre-Delivery';
    await book.save();

    await Notification.create({ user: borrower._id, type: 'Approved', message: `Your request for "${book.title}" was approved.` });
    res.json({ message: 'Approved', loanId: loan._id });
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
    try {
        const requests = await BorrowRequest.find({ lender: req.user._id })
            .populate('book', 'title author coverImage lendingFee')
            .populate('borrower', 'name')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
