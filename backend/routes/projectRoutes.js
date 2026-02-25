const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ message: "Projects route working ✅" });
});

module.exports = router;