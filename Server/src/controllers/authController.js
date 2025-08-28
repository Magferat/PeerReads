const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password });
    const token = sign(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, balance: user.balance } });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(400).json({ message: 'Invalid credentials' });
    const token = sign(user._id);
    user.password = undefined;
    res.json({ token, user });
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const ok = await user.matchPassword(currentPassword);
    if (!ok) return res.status(400).json({ message: 'Wrong current password' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
};
