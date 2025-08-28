const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const DamageReport = require('../models/DamageReport');

exports.markOnDelivery = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId).populate('book');
    if (!loan || String(loan.lender) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    loan.delivery.status = 'On Delivery';
    loan.delivery.timeline.push({ status: 'On Delivery' });
    await loan.save();
    loan.book.status = 'On Delivery';
    await loan.book.save();
    res.json({ message: 'Updated to On Delivery' });
};

exports.markAtBorrower = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId).populate('book');
    if (!loan || String(loan.borrower) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    loan.delivery.status = 'At Borrower';
    loan.delivery.timeline.push({ status: 'At Borrower' });
    loan.receivedAt = new Date();
    await loan.save();
    loan.book.status = 'At Borrower';
    await loan.book.save();
    res.json({ message: 'Borrower received' });
};

exports.requestReturn = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId);
    if (!loan || String(loan.lender) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    if (!loan.receivedAt) return res.status(400).json({ message: 'Not yet received by borrower' });
    const days = (Date.now() - new Date(loan.receivedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days < 10) return res.status(400).json({ message: `Can request return after 10 days` });
    loan.status = 'Return Requested';
    loan.returnRequestedAt = new Date();
    await loan.save();
    res.json({ message: 'Return requested' });
};

exports.confirmReturnOk = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId).populate('book lender borrower');
    if (!loan || String(loan.lender._id) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });

    loan.status = 'Returned';
    loan.returnedAt = new Date();
    await loan.save();

    const twoWayDelivery = loan.deliveryEstimate * 2;
    const totalDeductions = loan.lendingFee + loan.platformFee + twoWayDelivery;
    const refund = Math.max(loan.depositHold - totalDeductions, 0);

    const borrower = loan.borrower;
    borrower.lockedBalance -= loan.depositHold;
    borrower.balance += refund;
    await borrower.save();

    const lender = loan.lender;
    lender.balance += loan.lendingFee;
    await lender.save();

    const book = loan.book;
    book.status = 'Returned';
    await book.save();

    loan.status = 'Closed';
    await loan.save();

    res.json({ message: 'Refunded', refund, deductions: { twoWayDelivery, platformFee: loan.platformFee, lendingFee: loan.lendingFee } });
};

exports.reportDamage = async (req, res) => {
    const { loanId, description, amount } = req.body;
    const loan = await Loan.findById(loanId).populate('book');
    if (!loan || String(loan.lender) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    loan.status = 'Disputed';
    await loan.save();
    const dr = await new DamageReport({
        loan: loan._id,
        book: loan.book._id,
        lender: loan.lender,
        borrower: loan.borrower,
        description,
        claimedAmount: Number(amount)
    }).save();
    res.json({ message: 'Damage reported', reportId: dr._id });
};

exports.myLoans = async (req, res) => {
    const borrowed = await Loan.find({ borrower: req.user._id }).populate('book');
    const lent = await Loan.find({ lender: req.user._id }).populate('book');
    res.json({ borrowed, lent });
};
