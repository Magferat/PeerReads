const mongoose = require('mongoose');

const DamageReportSchema = new mongoose.Schema({
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: String,
    claimedAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
    resolvedAt: Date
});

module.exports = mongoose.model('DamageReport', DamageReportSchema);
