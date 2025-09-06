const User = require('../models/User');
const DamageReport = require('../models/DamageReport');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Notification = require("../models/Notification");

exports.bootstrapAdmin = async (req, res) => {
    const { token, name, email, password } = req.body;
    if (token !== process.env.ADMIN_BOOTSTRAP_TOKEN) return res.status(403).json({ message: 'Bad token' });
    let user = await User.findOne({ email });
    if (user) {
        user.role = 'admin';
        await user.save();
    } else {
        user = await User.create({ name, email, password, role: 'admin' });
    }
    res.json({ message: 'Admin ready', user: { id: user._id, email: user.email, role: user.role } });
};
exports.makeAdmin = async (req, res) => {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    await user.save();

    res.json({ message: `${user.email} is now an admin`, user: { id: user._id, email: user.email, role: user.role } });
};

exports.searchUsers = async (req, res) => {
    const { email } = req.query;
    const users = await User.find(email ? { email: new RegExp(email, 'i') } : {}).select('-password').limit(50);
    res.json(users);
};

exports.userActivity = async (req, res) => {
    const { id } = req.params;

    // Full user info (omit password)
    const user = await User.findById(id).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Loans where this user is borrower
    const borrowed = await Loan.find({ borrower: id })
        .populate("book", "title status")
        .populate("lender", "name email");

    // Loans where this user is lender
    const lent = await Loan.find({ lender: id })
        .populate("book", "title status")
        .populate("borrower", "name email");

    res.json({
        user,
        borrowed,
        lent
    });
};

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find()
            .populate("owner", "name email")
            .sort({ createdAt: -1 });

        res.json(books);
    } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).json({ message: "Failed to fetch books" });
    }
};
// Get one book by ID
exports.getBookById = async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findById(bookId).populate("owner", "name email");
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.json(book);
    } catch (err) {
        console.error("Error fetching book:", err);
        res.status(500).json({ message: "Failed to fetch book" });
    }
};

exports.updateBookStatus = async (req, res) => {
    const { bookId } = req.params;
    const { status } = req.body; // Allowed values in Book model
    const book = await Book.findByIdAndUpdate(bookId, { status }, { new: true });
    res.json(book);
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    let msg = "";
    if (user.role !== "admin") {
        await User.findByIdAndDelete(id);
        msg = 'User deleted';
    }
    else {
        msg = 'Cannot delete an admin.';
    }
    res.json({ message: msg });


};

// Get all damage reports (with borrower, lender, book info)
// exports.getDamageReports = async (req, res) => {
//     // console.log(res)
//     try {
//         const reports = await DamageReport.find()
//             .populate('loan')
//             .populate('borrower', 'name email')
//             .populate('lender', 'name email')
//             .populate('book', 'title status');

//         res.json(reports);
//         console.log(reports, "heeeeeeeeeeeeeeeee")
//     } catch (err) {
//         console.error("Error fetching damage reports:", err);
//         res.status(500).json({ message: "Failed to fetch damage reports" });
//     }
// };
exports.getDamageReports = async (req, res) => {
    try {
        const reports = await DamageReport.find({ status: "Pending" }) // only pending
            .populate('loan')
            .populate('borrower', 'name email')
            .populate('lender', 'name email')
            .populate('book', 'title status');

        res.json(reports);
        console.log(reports);
    } catch (err) {
        console.error("Error fetching damage reports:", err);
        res.status(500).json({ message: "Failed to fetch damage reports" });
    }
};
exports.resolveDamage = async (req, res) => {
    const { reportId } = req.params;
    const { deduction } = req.body;
    const report = await DamageReport.findById(reportId).populate('loan borrower lender');
    if (!report || report.status !== 'Pending') return res.status(400).json({ message: 'Invalid report' });

    const loan = await Loan.findById(report.loan._id).populate('book borrower lender');
    const borrower = loan.borrower;
    const lender = loan.lender;

    const amount = Math.min(Number(deduction || 0), loan.depositHold);

    borrower.balance += (loan.depositHold - loan.deliveryEstimate - loan.platformFee - amount);
    borrower.lockedBalance -= (loan.depositHold - amount);
    await borrower.save();



    lender.balance += amount;
    await lender.save();
    // loan.status = ""

    report.status = 'Resolved';
    report.resolvedAt = new Date();
    await report.save();

    loan.status = 'Closed';
    await loan.save();

    // const book = loan.book;
    // book.status = 'Available';
    // await book.save();
    const book = await Book.findById(report.book._id);
    book.status = 'Available';
    await book.save();


    await Notification.create({
        user: loan.borrower._id,
        type: "Dispute",
        message: `Admin deduct ${amount} for "${loan.book.title}" (Report ID: ${reportId}) Damage case. Rest Refunded`
    });
    await Notification.create({
        user: loan.lender._id,
        type: "Dispute",
        message: `Admin added a compensation ${amount} for "${loan.book.title}" (Report ID: ${reportId}) Damage case.`
    });

    // Schedule delete after 10 days
    setTimeout(async () => {
        await DamageReport.findByIdAndDelete(reportId);
        console.log(`Damage report ${reportId} deleted after 10 days`);
    }, 10 * 24 * 60 * 60 * 1000); // 10 days in ms

    res.json({ message: 'Damage resolved', amount });
};

// exports.resolveDamage = async (req, res) => {
//     const { reportId } = req.params;
//     const { deduction } = req.body; // amount to deduct from locked deposit
//     const report = await DamageReport.findById(reportId).populate('loan borrower lender');
//     if (!report || report.status !== 'Pending') return res.status(400).json({ message: 'Invalid report' });

//     const loan = await Loan.findById(report.loan._id).populate('book borrower lender');
//     const borrower = loan.borrower;
//     const lender = loan.lender;

//     // Deduct from locked balance up to depositHold
//     const amount = Math.min(Number(deduction || 0), loan.depositHold);
//     borrower.lockedBalance -= amount;
//     await borrower.save();

//     // Credit lender with amount (damage compensation)
//     lender.balance += amount;
//     await lender.save();

//     report.status = 'Resolved';
//     report.resolvedAt = new Date();
//     await report.save();

//     // Close loan if not already
//     loan.status = 'Closed';
//     await loan.save();

//     // Book back to Returned
//     const book = loan.book;
//     book.status = 'Available';
//     await book.save();

//     // Notify borrower
//     await Notification.create({
//         user: loan.borrower._id,
//         type: "Dispute",
//         message: `Admin deduct ${amount} for "${loan.book.title}" (Report ID:
//             ${reportId}) Damage case.`
//     });
//     // Notify Lender
//     await Notification.create({
//         user: loan.lender._id,
//         type: "Dispute",
//         message: `Admin added a compensation ${amount} for "${loan.book.title}" (Report ID:
//             ${reportId}) Damage case.`
//     });


//     res.json({ message: 'Damage resolved', amount });
// };
