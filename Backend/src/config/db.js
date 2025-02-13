const settings = require("./settings")
const sqlite3 = require("sqlite3").verbose();
const User = require("../models/User")

function pass_queries(query) {
    const db = new sqlite3.Database(settings.configs.database_property_1.default.LOCATION, (err) => {
                if (err && settings.configs.debug) {
                    console.error(err.message);
                } else {
                    if (settings.configs.debug) {
                        console.log("Database Connected successfully....");
                        }
                }
            })
    
        db.run(query, (err) => {
            if (err && settings.configs.debug) {
                console.log("No createed...", err.message);
            } else {
                if (settings.configs.debug) {
                    console.log("Table created successfully...")
                }
            }
        })

        db.close((err) => {
        if (err && settings.configs.debug) {
            console.log("DataBase is still open....", err.message);
        } else {
            if (settings.configs.debug) {
                console.log("CLosed successfully....")
            }
        }
    })

}

function insert_data( data, data_insert_function) {
    const db = new sqlite3.Database(settings.configs.database_property_1.default.LOCATION, (err) => {
                if (err && settings.configs.debug) {
                    console.error(err.message);
                } else {
                    if (settings.configs.debug) {
                        console.log("Database Connected successfully....");
                        }
                }
    })

    data_insert_function(db, data);
    
    db.close((err) => {
        if (err && settings.configs.debug) {
            console.log("DataBase is still open....", err.message);
        } else {
            if (settings.configs.debug) {
                console.log("CLosed successfully....")
            }
        }
    })
}

function delete_data(id, Table_function) {
    const db = new sqlite3.Database(settings.configs.database_property_1.default.LOCATION, (err) => {
                if (err && settings.configs.debug) {
                    console.error(err.message);
                } else {
                    if (settings.configs.debug) {
                        console.log("Database Connected successfully....");
                        }
                }
    })

    Table_function(db, id)

    db.close((err) => {
        if (err && settings.configs.debug) {
            console.log("DataBase is still open....", err.message);
        } else {
            if (settings.configs.debug) {
                console.log("CLosed successfully....")
            }
        }
    })
}

function get_data(data, fetch_data_function, apply) {
    const db = new sqlite3.Database(settings.configs.database_property_1.default.LOCATION, (err) => {
                if (err && settings.configs.debug) {
                    console.error(err.message);
                } else {
                    if (settings.configs.debug) {
                        console.log("Database Connected successfully....");
                        }
                }
    })

    const d = fetch_data_function(db, data, apply);

    db.close((err) => {
        if (err && settings.configs.debug) {
            console.log("DataBase is still open....", err.message);
        } else {
            if (settings.configs.debug) {
                console.log("CLosed successfully....")
            }
        }
    })
}

function create_tables(creation_function) {
    const db = new sqlite3.Database(settings.configs.database_property_1.default.LOCATION, (err) => {
                if (err && settings.configs.debug) {
                    console.error(err.message);
                } else {
                    if (settings.configs.debug) {
                        console.log("Database Connected successfully....");
                        }
                }
    })

    creation_function(db);

    db.close((err) => {
        if (err && settings.configs.debug) {
            console.log("DataBase is still open....", err.message);
        } else {
            if (settings.configs.debug) {
                console.log("CLosed successfully....")
            }
        }
    })
}

const db = new sqlite3.Database(settings.configs.database_property_1.default.LOCATION, (err) => {
                if (err && settings.configs.debug) {
                    console.error(err.message);
                } else {
                    if (settings.configs.debug) {
                        console.log("Database Connected successfully....");
                        }
                }
    })

// pass_queries(User.query_for_User.creation);

module.exports = {
    pass_queries,
    insert_data,
    delete_data,
    get_data,
    create_tables,
    db,
}