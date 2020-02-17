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
        bills: data
      });
    }
  });
});

app.post("/bills", function(req, res) {
  const newBill = req.body

  connection.query("INSERT INTO Bills SET ?", [newBill], function(err,data) {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      newBill.billId = data.insertId;
      newBill.renewalDate = new Date(newBill.renewalDate).toISOString();
      newBill.billType = body.billType;
      newBill.billProvider = body.billProvider;
      res.status(201).json({newBill});
    }
  });
});



module.exports.handler = serverless(app);