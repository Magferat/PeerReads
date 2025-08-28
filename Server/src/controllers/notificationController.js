const Notification = require('../models/Notification');

exports.mine = async (req, res) => {
    const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json(list);
};

exports.markRead = async (req, res) => {
    const { id } = req.params;
    const n = await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { read: true }, { new: true });
    res.json(n);
};
