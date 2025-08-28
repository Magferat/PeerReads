const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const LocationSchema = new mongoose.Schema({
    address: { type: String, default: '' },
    coords: { lat: Number, lng: Number }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    balance: { type: Number, default: 0 },
    lockedBalance: { type: Number, default: 0 },
    location: { type: LocationSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
