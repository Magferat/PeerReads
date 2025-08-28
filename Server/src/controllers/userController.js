const User = require('../models/User');
const Loan = require('../models/Loan');
const Book = require('../models/Book');

// exports.me = async (req, res) => res.json(req.user);
// controllers/userController.js
// Get my profile
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        const lendingBooks = await Book.find({ owner: req.user._id });
        const borrowingBooks = await Book.find({ 'borrowers.user': req.user._id });
        // const borrowingBooks = await Book.find({ borrowers: req.user._id });
        // console.log(lendingBooks, borrowingBooks, "hehe");

        res.json({ user, lendingBooks, borrowingBooks });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getUserProfile = async (req, res) => {

    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Lending books: books uploaded by user
        const lendingBooks = await Book.find({ lender: userId });

        // Borrowing books: books borrowed by user
        const borrowingBooks = await Book.find({ borrower: userId });

        res.json({ user, lendingBooks, borrowingBooks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Update my profile
exports.updateMyProfile = async (req, res) => {
    const { username, email, address, coords } = req.body;
    const user = await User.findById(req.user._id);

    console.log(user.location.coords)
    try {
        // console.log(req, "here")
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const { username, email, address, coords } = req.body;
        // console.log(location, "yoo");
        if (username) user.name = username;
        if (email) user.email = email;
        if (address) user.location.address = address; // save live location
        console.log("hereeeeeeee")
        if (coords) user.location.coords = coords; // save live location


        await user.save();
        res.json({ message: "Profile updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// exports.updateProfile = async (req, res) => {
//     const { name } = req.body;
//     const user = await User.findByIdAndUpdate(req.user._id, { name }, { new: true });
//     res.json(user);
// };

// exports.updateAddress = async (req, res) => {
//     const { address, lat, lng } = req.body;
//     const user = await User.findByIdAndUpdate(
//         req.user._id,
//         { location: { address, coords: { lat, lng } } },
//         { new: true }
//     );
//     res.json(user);
// };

// Demo top-up to simulate wallet funding
exports.topUp = async (req, res) => {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);
    user.balance += Number(amount || 0);
    await user.save();
    res.json({ balance: user.balance });
};

exports.activity = async (req, res) => {
    const borrowed = await Loan.find({ borrower: req.user._id }).populate('book');
    const lent = await Loan.find({ lender: req.user._id }).populate('book');
    res.json({ borrowed, lent });
};
