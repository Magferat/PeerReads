const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
    const notifs = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .lean();
    res.json(notifs);
};

exports.markAsRead = async (req, res) => {
    const notif = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notif) return res.status(404).json({ message: "Not found" });
    notif.read = true;
    await notif.save();
    res.json({ success: true });
};
