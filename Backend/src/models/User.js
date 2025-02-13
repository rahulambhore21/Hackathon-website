const settings = require("../config/settings");
const database = require("../config/db");
const moments = require("moment");
var count = 0;

const query_for_User = {
    creation: `CREATE TABLE User (
        Uid VARCHAR(15) PRIMARY KEY,
        UserName VARCHAR(100) NOT NULL,
        TimeOfSignIn TIME DEFAULT CURRENT_TIME,
        DateofSignIn DATE DEFAULT CURRENT_DATE,
        Email TEXT NOT NULL UNIQUE,
        Password VARCHAR(50) NOT NULL,
        Verified CHAR(1) DEFAULT 'N' );`,
    insert: `INSERT INTO User ( Uid, UserName, Email, Password,)
             VALUES (?, ?, ?, ?);`,
    delete: "DELETE FROM User WHERE Uid = ?;",
    fetch_id: `SELECT * FROM User WHERE Uid = ?;`,
    fetch_email:`SELECT * FROM User WHERE Email = ?;`,
    all: "SELECT * FROM User;",
    delete_table:`DROP TABLE IF EXISTS User;`
}

function create_table() {
    return new Promise((resolve, reject) => {
        database.db.all(query_for_User.creation, [], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

function get_user_id(Uid) {
    return new Promise((resolve, reject) => {
        database.db.get(query_for_User.fetch_id, [Uid], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

function get_user_email(Email) {
    return new Promise((resolve, reject) => {
        database.db.get(query_for_User.fetch_email, [Email], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

function fetch_user() {
    return new Promise((resolve, reject) => {
        database.db.all(query_for_User.all, [], (err, rows) => {
            if (err) reject(err)
            resolve(rows);
        })
    })
}

function addUser(UserInfo) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var Uid = moments().format("HHmmssDDMMYYYY");
    Uid = Uid + characters[count];
    count++;
    if (count > characters.length) {
        count = 0;
    }
    
    return new Promise((resolve, reject) => {
        database.db.all(query_for_User.insert, [
            Uid, UserInfo.UserName,
            UserInfo.Email, UserInfo.Password,
        ], (err, rows) => {
            if (err) reject(err)
            resolve(rows);
        })
    })
}

function removeUser(Uid) {
    return new Promise((resolve, reject) => {
        database.db.all(query_for_User.delete, [Uid], (err, rows) => {
            if (err) reject(rows)
            resolve(rows)
        })
    })
}

function delete_table() {
    return new Promise((resolve, reject) => {
        database.db.all(query_for_User.delete_table, [], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

module.exports = {
    query_for_User,
    create_table,
    get_user_id,
    get_user_email,
    fetch_user,
    addUser,
    removeUser,
    delete_table,
}