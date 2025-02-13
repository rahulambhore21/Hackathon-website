const settings = require("../config/settings");
const AuthController = require("./authController");
const UserController = require("./userController");
const EventController = require("./eventsController");
const RegistrationController = require("./registration");
const staticFilesController = require("./staticFilesController");

module.exports = {
    AuthController,
    UserController,
    EventController,
    RegistrationController,
    staticFilesController,
 }