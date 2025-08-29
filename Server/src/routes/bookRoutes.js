const router = require('express').Router();
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require("../middleware/upload");

const { create, list, mineLent, update, remove } = require("../controllers/bookController");


router.post("/", protect, upload.single("coverImage"), create);
router.put("/:id", protect, upload.single("coverImage"), update);
router.delete("/:id", protect, remove);
router.get("/", optionalAuth, list); // ?q=titleOrAuthor&genre=Fiction
router.get("/mine", protect, mineLent);
module.exports = router;
// ======
// const upload = require("../middleware/upload");
// const { create, list, mineLent, update, remove } = require("../controllers/bookController");

// router.post("/", protect, upload.single("coverImage"), create);
// router.put("/:id", protect, upload.single("coverImage"), update);
// router.delete("/:id", protect, remove);
// router.get("/", list);
// router.get("/mine", protect, mineLent);
