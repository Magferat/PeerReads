const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const DamageReport = require('../models/DamageReport');
const Notification = require("../models/Notification");

// exports.markOnDelivery = async (req, res) => {
//     const { loanId } = req.body;
//     console.log(loanId, "here Marked on Delv...................................");


//     const loan = await Loan.findById(loanId).populate('book');
//     if (!loan || String(loan.lender) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
//     loan.delivery.status = 'On Delivery';
//     loan.delivery.timeline.push({ status: 'On Delivery' });
//     await loan.save();
//     loan.book.status = 'On Delivery';
//     await loan.book.save();
//     res.json({ message: 'Updated to On Delivery' });
// };
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
        message: `Your loan "${loan.book.title}" is on the way.`
    });

    res.json({ message: "Book marked On Delivery" });
};

// exports.markAtBorrower = async (req, res) => {
//     const { loanId } = req.body;
//     const loan = await Loan.findById(loanId).populate('book');
//     if (!loan || String(loan.borrower) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
//     loan.delivery.status = 'At Borrower';
//     loan.delivery.timeline.push({ status: 'At Borrower' });
//     loan.receivedAt = new Date();
//     await loan.save();
//     loan.book.status = 'At Borrower';
//     await loan.book.save();
//     res.json({ message: 'Borrower received' });
// };

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



// exports.requestReturn = async (req, res) => {
//     const { loanId } = req.body;
//     const loan = await Loan.findById(loanId);
//     if (!loan || String(loan.lender) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
//     if (!loan.receivedAt) return res.status(400).json({ message: 'Not yet received by borrower' });
//     // const days = (Date.now() - new Date(loan.receivedAt).getTime()) / (1000 * 60 * 60 * 24);
//     // if (days < 10) return res.status(400).json({ message: `Can request return after 10 days` });
//     loan.status = 'Return Requested';
//     loan.returnRequestedAt = new Date();
//     await loan.save();
//     res.json({ message: 'Return requested' });
// };
exports.lenderRequestReturn = async (req, res) => {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId).populate("book borrower lender");
    if (!loan || String(loan.lender._id) !== String(req.user._id))
        return res.status(403).json({ message: "Not allowed" });

    loan.delivery.timeline.push({ status: "Return Requested" });
    await loan.save();
    const book = await Book.findById(loan.book._id);
    book.status = "Return Requested";
    book.save();


    await Notification.create({ user: loan.borrower._id, type: "Return", message: `Lender requested return of "${loan.book.title}".` });
    res.json({ message: "Return requested" });
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


// borrower confirms item OK
// Borrower confirms OK
// Lender confirms book is okay after return
// exports.lenderConfirmOk = async (req, res) => {
//     const { loanId } = req.body;
//     const loan = await Loan.findById(loanId).populate("book borrower lender");
//     if (!loan || String(loan.lender._id) !== String(req.user._id))
//         return res.status(403).json({ message: "Not allowed" });

//     // Refund borrower deposit minus delivery cost
//     // loan.borrower.balance += (loan.depositHold - loan.deliveryEstimate - loan.platformFee);
//     // loan.borrower.lockedBalance -= loan.depositHold;
//     // await loan.borrower.save();

//     // Pay lender lending fee
//     // loan.lender.balance += loan.lendingFee;
//     // await loan.lender.save();

//     // Close loan
//     loan.status = "Closed";
//     loan.delivery.status = "Returned";
//     loan.delivery.timeline.push({ status: "Returned" });
//     loan.book.status = "Available";
//     console.log(loan.book.status, "heeeeeeeeeeeeeeeeeeeeeeeee");
//     await loan.save();

//     await Notification.create({ user: loan.lender._id, type: "Balance", message: `Fee credited for "${loan.book.title}".` });
//     await Notification.create({ user: loan.borrower._id, type: "Deposit", message: `Deposit refunded for "${loan.book.title}".` });

//     res.json({ message: "Loan closed successfully" });
// };
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

// Lender reports damage
// exports.lenderReportDamage = async (req, res) => {
//     const { loanId } = req.body;
//     const loan = await Loan.findById(loanId).populate("book borrower lender");
//     if (!loan || String(loan.lender._id) !== String(req.user._id))
//         return res.status(403).json({ message: "Not allowed" });

//     loan.status = "Disputed";
//     loan.delivery.timeline.push({ status: "Disputed" });
//     loan.book.status = "Disputed";

//     await loan.save();

//     await Notification.create({ user: loan.borrower._id, type: "Dispute", message: `Lender reported damage for "${loan.book.title}".` });
//     await Notification.create({ user: "admin", type: "Dispute", message: `Dispute raised for "${loan.book.title}". Please review.` });

//     res.json({ message: "Dispute created, awaiting admin review" });
// };

// exports.lenderReportDamage = async (req, res) => {
//     console.log("here comes rain again............................---------------------------")
//     const { loanId } = req.body;
//     const loan = await Loan.findById(loanId).populate("book borrower lender");
//     if (!loan || String(loan.lender._id) !== String(req.user._id))
//         return res.status(403).json({ message: "Not allowed" });

//     loan.status = "Disputed";
//     loan.delivery.timeline.push({ status: "Disputed" });
//     await loan.save();

//     // ✅ Update book status properly
//     const book = await Book.findById(loan.book._id);
//     book.status = "Disputed";
//     await book.save();

//     await Notification.create({ user: loan.borrower._id, type: "Dispute", message: `Lender reported damage for "${loan.book.title}".` });
//     await Notification.create({ user: "admin", type: "Dispute", message: `Dispute raised for "${loan.book.title}". Please review.` });

//     res.json({ message: "Dispute created, book marked as disputed" });
// };

// exports.lenderReportDamage = async (req, res) => {
//     console.log("here comes rain again............................---------------------------");
//     const { loanId } = req.body;
//     const loan = await Loan.findById(loanId).populate("book borrower lender");
//     if (!loan || String(loan.lender._id) !== String(req.user._id))
//         return res.status(403).json({ message: "Not allowed" });

//     loan.status = "Disputed";
//     loan.delivery.timeline.push({ status: "Disputed" });
//     await loan.save();

//     // ✅ Update book status properly
//     const book = await Book.findById(loan.book._id);
//     book.status = "Disputed";
//     await book.save();

//     // notify borrower
//     await Notification.create({
//         user: loan.borrower._id,
//         type: "Dispute",
//         message: `Lender reported damage for "${loan.book.title}".`,
//     });

//     // notify an admin (first one found)
//     const adminUser = await User.findOne({ role: "admin" });
//     if (adminUser) {
//         await Notification.create({
//             user: adminUser._id,
//             type: "Dispute",
//             message: `Dispute raised for "${loan.book.title}". Please review.`,
//         });
//     }

//     res.json({ message: "Dispute created, book marked as disputed" });
// };


exports.lenderReportDamage = async (req, res) => {
    console.log("here comes rain again............................---------------------------");
    const { loanId, description, claimedAmount } = req.body;

    const loan = await Loan.findById(loanId).populate("book borrower lender");
    if (!loan || String(loan.lender._id) !== String(req.user._id)) {
        return res.status(403).json({ message: "Not allowed" });
    }

    // mark loan + book as disputed
    loan.status = "Disputed";
    loan.delivery.timeline.push({ status: "Disputed" });
    await loan.save();

    const book = await Book.findById(loan.book._id);
    book.status = "Disputed";
    await book.save();

    // ✅ create DamageReport entry
    const report = await DamageReport.create({
        loan: loan._id,
        book: book._id,
        lender: loan.lender._id,
        borrower: loan.borrower._id,
        description: description || "Damage reported by lender",
        claimedAmount: claimedAmount || 0,
    });

    // notify borrower
    await Notification.create({
        user: loan.borrower._id,
        type: "Dispute",
        message: `Lender reported damage for "${loan.book.title}".`,
    });

    // notify all admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
        await Notification.create({
            user: admin._id,
            type: "Dispute",
            message: `Dispute raised for "${loan.book.title}". Please review.`,
        });
    }

    res.json({ message: "Dispute created, book marked as disputed", report });
};


// exports.reportDamage = async (req, res) => {
//     const { loanId, description, amount } = req.body;
//     const loan = await Loan.findById(loanId).populate('book');
//     if (!loan || String(loan.lender) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
//     loan.status = 'Disputed';
//     await loan.save();
//     const dr = await new DamageReport({
//         loan: loan._id,
//         book: loan.book._id,
//         lender: loan.lender,
//         borrower: loan.borrower,
//         description,
//         claimedAmount: Number(amount)
//     }).save();
//     res.json({ message: 'Damage reported', reportId: dr._id });
// };

exports.myLoans = async (req, res) => {
    console.log("my loan-------------------------")
    const borrowed = await Loan.find({ borrower: req.user._id }).populate('book');
    const lent = await Loan.find({ lender: req.user._id }).populate('book');
    // console.log(borrowed)
    res.json({ borrowed, lent });
};
