
const mongoose = require('mongoose');

const BorrowRequestSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrower_adr: { type: String, required: true, default: "" },
    lender_adr: { type: String, required: true, default: "" },
    originalPrice: { type: Number, required: true, default: 0 },
    distance: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', "On Proceed"],
        default: 'Pending'
    },
    message: String,
    createdAt: { type: Date, default: Date.now },
    approvedAt: Date
});

module.exports = mongoose.model('BorrowRequest', BorrowRequestSchema);
