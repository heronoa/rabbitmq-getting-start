const express = require("express");
const publicController = require("../../controllers/PublicController");

const router = express.Router();

router.post("/login", publicController.login);
router.post("/register", publicController.register);

module.exports = router;
