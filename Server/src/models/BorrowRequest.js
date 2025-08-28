const mongoose = require('mongoose');

const BorrowRequestSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
    message: String,
    createdAt: { type: Date, default: Date.now },
    approvedAt: Date
});

module.exports = mongoose.model('BorrowRequest', BorrowRequestSchema);
