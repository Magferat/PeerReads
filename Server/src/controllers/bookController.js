const Book = require('../models/Book');
const { calcLendingFee } = require('../utils/fees');

exports.create = async (req, res) => {
    const { title, author, genre, originalPrice } = req.body;
    const lendingFee = calcLendingFee(originalPrice);
    console.log(req, "noooooo");
    const book = await Book.create({
        owner: req.user._id,
        coverImage: req.file ? `/uploads/books/${req.file.filename}` : null,
        // coverImage: `/uploads/books/${req.file.filename}`,
        title,
        author,
        genre: genre.split(","), // user selects multiple
        originalPrice,
        lendingFee,
        status: "Available"
    });

    res.json(book);
};
// uploads\books
exports.update = async (req, res) => {
    const { id } = req.params;
    const { title, author, genre, originalPrice } = req.body;

    const book = await Book.findOne({ _id: id, owner: req.user._id });
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre ? genre.split(",") : book.genre;
    book.originalPrice = originalPrice ?? book.originalPrice;
    book.lendingFee = calcLendingFee(book.originalPrice);
    if (req.file) book.coverImage = `/uploads/books/${req.file.filename}`;

    await book.save();
    res.json(book);
};

exports.remove = async (req, res) => {
    const { id } = req.params;
    const book = await Book.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
};

exports.list = async (req, res) => {

    const { q, genre } = req.query;
    const where = { status: 'Available' };
    if (genre) where.genre = genre;
    if (q) where.$text = { $search: q };
    const books = await Book.find(where).populate('owner', 'name');
    res.json(books);
};

exports.mineLent = async (req, res) => {
    const lendBooks = await Book.find({ owner: req.user._id });
    // console.log(lendBooks, "bc");
    res.json(lendBooks);
};
