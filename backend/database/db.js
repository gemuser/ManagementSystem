const mysql = require('mysql2/promise');
dotenv = require('dotenv');
dotenv.config();
const pool = mysql.createPool({
    host : "localhost",
    user: "root",
    password: "abiral",
    database: "inventory_system",
    port: 3306
})

module.exports = pool;
