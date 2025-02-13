const settings = require("../config/settings")

function handleError(err, req, res, next) {
    settings.trigger_Error(err)
    if (res.headersSent) return next(err)
    res.status(500).json({error:"Internal Error"})
}

function notFound(req, res) {
    res.status(404).json({error:"Not Found"})
}

module.exports = {
    handleError,
    notFound,
}