const User = require('../models/User');
const DamageReport = require('../models/DamageReport');
const Loan = require('../models/Loan');
const Book = require('../models/Book');

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
    const borrowed = await Loan.find({ borrower: id }).populate('book');
    const lent = await Book.find({ owner: id });
    res.json({ borrowed, lent });
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
    await User.findByIdAndDelete(id);
    // (In production you would also clean up related docs or soft-delete)
    res.json({ message: 'User deleted' });
};

// Get all damage reports (with borrower, lender, book info)
exports.getDamageReports = async (req, res) => {
    // console.log(res)
    try {
        const reports = await DamageReport.find()
        // .populate('loan')
        // .populate('borrower', 'name email')
        // .populate('lender', 'name email')
        // .populate('book', 'title status');

        res.json(reports);
        console.log(reports, "heeeeeeeeeeeeeeeee")
    } catch (err) {
        console.error("Error fetching damage reports:", err);
        res.status(500).json({ message: "Failed to fetch damage reports" });
    }
};

exports.resolveDamage = async (req, res) => {
    const { reportId } = req.params;
    const { deduction } = req.body; // amount to deduct from locked deposit
    const report = await DamageReport.findById(reportId).populate('loan borrower lender');
    if (!report || report.status !== 'Pending') return res.status(400).json({ message: 'Invalid report' });

    const loan = await Loan.findById(report.loan._id).populate('book borrower lender');
    const borrower = loan.borrower;
    const lender = loan.lender;

    // Deduct from locked balance up to depositHold
    const amount = Math.min(Number(deduction || 0), loan.depositHold);
    borrower.lockedBalance -= amount;
    await borrower.save();

    // Credit lender with amount (damage compensation)
    lender.balance += amount;
    await lender.save();

    report.status = 'Resolved';
    report.resolvedAt = new Date();
    await report.save();

    // Close loan if not already
    loan.status = 'Closed';
    await loan.save();

    // Book back to Returned
    const book = loan.book;
    book.status = 'Returned';
    await book.save();

    res.json({ message: 'Damage resolved', amount });
};
