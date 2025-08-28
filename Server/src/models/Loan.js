const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
    pickupAt: Date,
    status: { type: String, enum: ['Pre-Delivery', 'On Delivery', 'At Borrower'], default: 'Pre-Delivery' },
    timeline: [{ status: String, at: { type: Date, default: Date.now } }]
}, { _id: false });

const LoanSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    depositHold: { type: Number, required: true },        // price + one-way delivery
    deliveryEstimate: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    lendingFee: { type: Number, required: true },
    delivery: { type: DeliverySchema, default: () => ({}) },
    receivedAt: Date,
    returnRequestedAt: Date,
    returnedAt: Date,
    status: { type: String, enum: ['Active', 'Return Requested', 'Returned', 'Disputed', 'Closed'], default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', LoanSchema);
