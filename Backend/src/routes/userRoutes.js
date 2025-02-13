const settings = require("../config/settings");
const MainController = require("../controller/MainController");
const express = require('express');
const router = express.Router();

router.get("/", MainController.UserController.fetch_All_User);
router.post("/login", MainController.UserController.fetch_User);
router.post("/SignIn", MainController.UserController.Add_User);
router.get("/DelUser", MainController.UserController.Remove_User);
router.get("/CreateTable", MainController.UserController.create_table);
router.get("/DelTable", MainController.UserController.delete_table)

module.exports = {
    router
}