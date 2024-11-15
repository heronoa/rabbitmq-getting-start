const express = require("express");
const userController = require("../../controllers/AdminController"); // Controlador responsável pela lógica dos pedidos

const router = express.Router();

router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
