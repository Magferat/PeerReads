// const mongoose = require('mongoose');

// const BorrowRequestSchema = new mongoose.Schema({
//     book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
//     lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     originalPrice: { type: Number, required: true, default: 0 },
//     status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
//     message: String,
//     createdAt: { type: Date, default: Date.now },
//     approvedAt: Date
// });

// module.exports = mongoose.model('BorrowRequest', BorrowRequestSchema);
const mongoose = require('mongoose');

const BorrowRequestSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalPrice: { type: Number, required: true, default: 0 },
    distance: { type: String },   // e.g. "5.4 km"
    duration: { type: String },   // e.g. "12 mins"
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    message: String,
    createdAt: { type: Date, default: Date.now },
    approvedAt: Date
});

module.exports = mongoose.model('BorrowRequest', BorrowRequestSchema);
