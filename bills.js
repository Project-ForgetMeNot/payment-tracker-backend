const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "bills"
});

app.get("/bills", function(req, res) {
  connection.query("SELECT * FROM Bills", function(err, data) {
    if (err) {
      res.status(500).json({
        error: err
      })
    } else {
      res.status(200).json({
        todos: data
      });
    }
  });
});
