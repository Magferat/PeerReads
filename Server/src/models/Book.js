const mongoose = require('mongoose');

// const BookSchema = new mongoose.Schema({
//     owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     title: { type: String, required: true, index: 'text' },
//     author: { type: String, required: true, index: 'text' },
//     genre: { type: String, index: true },
//     originalPrice: { type: Number, required: true, min: 0 },
//     lendingFee: { type: Number, required: true }, // 10%
//     status: { type: String, enum: ['Available', 'Pre-Delivery', 'On Delivery', 'At Borrower', 'Returned', 'Disputed'], default: 'Available' },
//     createdAt: { type: Date, default: Date.now }
//     borrowers: {[list user ids of borrowers]}
// });

// module.exports = mongoose.model('Book', BookSchema);
// ===============================================
// const mongoose = require('mongoose');

// const BookSchema = new mongoose.Schema({
//     owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     title: { type: String, required: true, index: 'text' },
//     author: { type: String, required: true, index: 'text' },
//     genre: { type: String, index: true },
//     originalPrice: { type: Number, required: true, min: 0 },
//     lendingFee: { type: Number, required: true },
//     status: { type: String, enum: ['Available', 'Pre-Delivery', 'On Delivery', 'At Borrower', 'Returned', 'Disputed'], default: 'Available' },
//     createdAt: { type: Date, default: Date.now },
//     borrowers: [{
//         user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//         borrowedAt: { type: Date, default: Date.now }, // When the book was taken
//         returnedAt: { type: Date }, // When the book was brought back
//     }]
// });

// module.exports = mongoose.model('Book', BookSchema);

const BookSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverImage: { type: String }, // 📸 store file path / URL
    title: { type: String, required: true, index: 'text' },
    author: { type: String, required: true, index: 'text' },
    genre: [{ type: String, index: true }], // ✅ multiple genres
    originalPrice: { type: Number, required: true, min: 0 },
    lendingFee: { type: Number, required: true },
    status: { type: String, enum: ['Available', 'Pre-Delivery', 'On Delivery', 'At Borrower', 'Returned', 'Disputed'], default: 'Available' },
    createdAt: { type: Date, default: Date.now },
    borrowers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        borrowedAt: { type: Date, default: Date.now },
        returnedAt: { type: Date },
    }]
});
module.exports = mongoose.model('Book', BookSchema);
