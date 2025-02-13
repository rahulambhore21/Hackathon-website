const settings = require("../config/settings");
const MainModel = require("../models/MainModel")

const create_table = async (req, res, next) => {
    try {
        const created = await MainModel.UserModel.create_table();
        if (created) {
            res.status(200).json({ content: created });
        } else {
            res.status(300).json({ error: "Error whiling creating the table....." });
        }
     } catch (err) {
        next(err)
    }
}

const fetch_All_User = async (req, res, next) => {
    try {
        const User = await MainModel.UserModel.fetch_user();
        // if (!User) res.status(300).json({ error: "No User Found" });
        res.status(200).json(User);
    } catch (err) {
        next(err);
    }
}

const fetch_User = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const User = await MainModel.UserModel.get_user_email(email);
        // settings.trigger_Error(User)
        if (User && (User.Password == password) && password) {
            res.status(200).json(User);
        } else {

            res.status(300).json({ error: "no user found.." })
        }
    } catch (err) {
        next(err)
    }
}

const Add_User = async (req, res, next) => {
    const User = req.body;
    // console.log(User);
    try {
        const  s = MainModel.UserModel.addUser(User);
        settings.trigger_Error(User)
        if (s) {
            res.status(200).json(User);
        } else {
            res.status(300).json({error:"User No Added..."})
        }
    } catch (err) {
        next(err)
    }
}

const Remove_User = async (req, res, next) => {
    const { Uid } = req.query;
    try { 
        const s = MainModel.UserModel.removeUser(Uid)
        settings.trigger_Error(Uid)
        if (s) {
            res.status(200).json({"uid":Uid});
        } else {
            res.status(300).json({error:"User No Deleted.."})
        }
    } catch (err) {
        next(err)
    }
}

const delete_table = async (req, res, next) => {
    try {
        const deleted = await MainModel.UserModel.delete_table();
        res.status(200).json({ title: "Deleted table successfully..", data: deleted });
     } catch (err) {
        next(err)
    }
}



module.exports = {
    create_table,
    fetch_User,
    fetch_All_User,
    Add_User,
    Remove_User,
    delete_table,
}