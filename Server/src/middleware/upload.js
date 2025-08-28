const multer = require("multer");
const path = require("path");

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "../../../uploads/books"),
//     filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
// });

// module.exports = multer({ storage });
const absolutePath = path.join(__dirname, '..', '..', '..', 'uploads', 'books');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Log the path to confirm it's correct
        console.log("Saving file to:", absolutePath);
        cb(null, absolutePath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

module.exports = multer({ storage });