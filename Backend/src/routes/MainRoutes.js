const settings = require("../config/settings");
const AuthRoutes = require('./authRoutes');
const UserRoutes = require("./userRoutes");
const EventsRoutes = require("./eventsRoutes");
const RegistrationRoutes = require("./registrationRoutes")
module.exports = {
    AuthRoutes,
    UserRoutes,
    EventsRoutes,
    RegistrationRoutes,
}