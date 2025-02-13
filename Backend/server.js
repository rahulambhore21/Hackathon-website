const fs = require('fs').promises;
const path = require('path');
const express = require("express");
const settings = require("./src/config/settings.js");
const cors = require("cors");

// const MainRoutes = require("./src/routes/MainRoutes.js")
// const MainMiddleware = require('./src/middleware/MainMiddleware.js');
// const errorHandleMiddleware = require("./src/middleware/errorMiddleware.js");
// const MainController = require("./src/controller/MainController.js");

if (settings.configs.debug) {
    console.clear();
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => { res.end("working..") })

app.listen(settings.configs.PORT, settings.configs.allowed_host[0], () => console.log(`Server listening on port:${settings.configs.PORT} \nLink: http://${settings.configs.allowed_host[0]}:${settings.configs.PORT}`));