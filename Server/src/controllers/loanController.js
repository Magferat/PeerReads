const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const DamageReport = require('../models/DamageReport');
const Notification = require("../models/Notification");


// Lender marks item dispatched
exports.markOnDelivery = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId).populate("book borrower lender");
    if (!loan || String(loan.lender._id) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });

    loan.delivery.status = "On Delivery";
    loan.delivery.timeline.push({ status: "On Delivery" });
    await loan.save();
    const book = await Book.findById(loan.book._id);
    book.status = "On Delivery";
    book.save();

    await Notification.create({
        user: loan.borrower._id,
        type: "Delivery",
        message: `Your loan "${loan.book.title}" is on the way. Delivery withing 3-4 days.`
    });

    res.json({ message: "Book marked On Delivery" });
};



// Borrower confirms received
exports.markReceived = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId).populate("book borrower lender");
    if (!loan || String(loan.borrower._id) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });

    loan.delivery.status = "At Borrower";
    loan.delivery.timeline.push({ status: "At Borrower" });
    await loan.save();
    const book = await Book.findById(loan.book._id);
    book.status = "At Borrower";
    book.save();

    await Notification.create({
        user: loan.lender._id,
        type: "Borrower",
        message: `Borrower confirmed receiving "${loan.book.title}".`
    });

    res.json({ message: "Borrower marked item received" });
}




exports.lenderRequestReturn = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId).populate("book borrower lender");
    if (!loan || String(loan.lender._id) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });
    //  if (!loan.receivedAt) return res.status(400).json({ message: 'Not yet received by borrower' });
    //     // const days = (Date.now() - new Date(loan.receivedAt).getTime()) / (1000 * 60 * 60 * 24);
    //     // if (days < 10) return res.status(400).json({ message: `Can request return after 10 days` });
    loan.delivery.timeline.push({ status: "Return Requested" });
    loan.status = "Return Requested"
    await loan.save();
    const book = await Book.findById(loan.book._id);
    book.status = "Return Requested";
    book.save();


    await Notification.create({ user: loan.borrower._id, type: "Return", message: `Lender requested return of "${loan.book.title}" Please Return ASAP!.` });
    res.json({ message: "Return requested for" });
};


// Borrower schedules return
exports.borrowerScheduleReturn = async (req, res) => {
    const { loanId, returnAt } = req.body;
    const loan = await Loan.findById(loanId).populate("book borrower lender");
    if (!loan || String(loan.borrower._id) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });
    loan.delivery.status = "Return Scheduled";

    loan.delivery.timeline.push({ status: `Return Scheduled: ${returnAt}` });
    await loan.save();

    const book = await Book.findById(loan.book._id);
    book.status = "Return Scheduled";
    book.save();


    await Notification.create({ user: loan.lender._id, type: "Return", message: `Borrower scheduled return for "${loan.book.title}"` });
    res.json({ message: "Return scheduled" });
};

// controllers/loanController.js
exports.notReturning = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId).populate("book borrower lender");

    if (!loan) return res.status(404).json({ message: "Loan not found" });
    if (String(loan.lender._id) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });

    // check if already disputed
    if (loan.status === "Disputed")
        return res.status(400).json({ message: "Already disputed" });

    // mark loan & book as disputed
    loan.status = "Disputed";
    // loan.delivery
    loan.delivery.timeline.push({ status: "Disputed", at: new Date() });
    await loan.save();

    const book = await Book.findById(loan.book._id);
    if (book) {
        book.status = "Disputed";
        await book.save();
    }

    const report = await DamageReport.create({
        loan: loan._id,
        book: loan.book._id,
        lender: loan.lender._id,
        borrower: loan.borrower._id,
        description: "Borrower Not Returing",
        claimedAmount: loan.depositHold || 0
    });

    // Notify borrower
    await Notification.create({
        user: loan.borrower._id,
        type: "Dispute",
        message: `Lender reported that you did not return "${loan.book.title}" in time.`,
    });

    // Notify admin
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
        await Notification.create({
            user: adminUser._id,
            type: "Dispute",
            message: `Borrower failed to return "${loan.book.title}" (Loan ID: ${loan._id}). Please review.`,
        });
    }

    res.json({ message: "Marked as not returned, dispute created" });
};


exports.lenderConfirmOk = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId).populate("book borrower lender");
    if (!loan || String(loan.lender._id) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });

    // Refund borrower deposit minus delivery + platform fee
    loan.borrower.balance += (loan.depositHold - loan.deliveryEstimate - loan.platformFee);
    loan.borrower.lockedBalance -= loan.depositHold;
    await loan.borrower.save();

    // Pay lender lending fee
    loan.lender.balance += loan.lendingFee;
    await loan.lender.save();

    // Update loan
    loan.status = "Closed";
    loan.delivery.status = "Returned";
    loan.delivery.timeline.push({ status: "Returned" });
    await loan.save();



    // ✅ Update book status properly
    const book = await Book.findById(loan.book._id);
    book.status = "Available";
    await book.save();

    await Notification.create({ user: loan.lender._id, type: "Balance", message: `Fee credited for "${loan.book.title}".` });
    await Notification.create({ user: loan.borrower._id, type: "Deposit", message: `Deposit refunded for "${loan.book.title}".` });

    res.json({ message: "Loan closed successfully, book re-available" });
};

exports.lenderReportDamage = async (req, res) => {
    const { loanId, description } = req.body;
    const loan = await Loan.findById(loanId).populate("book borrower lender");
    if (!loan || String(loan.lender._id) !== String(req.user._id)) {
        return res.status(403).json({ message: "Not allowed" });
    }

    // Check if damage report already exists
    const existingReport = await DamageReport.findOne({ loan: loanId, status: "Pending" });
    if (existingReport) {
        return res.status(400).json({ message: "Damage already reported for this loan" });
    }

    // Mark loan + book as disputed
    loan.status = "Disputed";
    loan.delivery.timeline.push({ status: "Disputed" });
    await loan.save();

    const book = await Book.findById(loan.book._id);
    book.status = "Disputed";
    await book.save();

    // Create a new damage report
    const report = await DamageReport.create({
        loan: loan._id,
        book: loan.book._id,
        lender: loan.lender._id,
        borrower: loan.borrower._id,
        description: description || "No description provided",
        claimedAmount: loan.depositHold || 0
    });

    // Notify borrower
    await Notification.create({
        user: loan.borrower._id,
        type: "Dispute",
        message: `Lender reported damage for "${loan.book.title} Id : ${loan._id}". Please contact admin at read@cycle.com`
    });

    // Notify admin
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
        await Notification.create({
            user: adminUser._id,
            type: "Dispute",
            message: `Dispute raised for "${loan.book.title}". Please review.`
        });
    }

    res.json({ message: "Damage reported successfully", report });
};

exports.myLoans = async (req, res) => {
    console.log("my loan-------------------------")
    const borrowed = await Loan.find({ borrower: req.user._id })
        .populate('book')
        .populate("lender", "name email")
    const lent = await Loan.find({ lender: req.user._id }).populate('book')
        .populate("borrower", "name email");;
    // console.log(borrowed)
    res.json({ borrowed, lent });
};
