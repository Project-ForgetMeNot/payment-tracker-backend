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

app.get("/bills", function (req, res) {
  connection.query("SELECT * FROM Bills", function (err, data) {
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

app.post("/bills", function (req, res) {
  const newBill = req.body;
  if (!newBill.billType || !newBill.renewalDate || !newBill.billProvider || !newBill.emailAdd) {
    return res.status(500).json({
      error: "Input fields empty"
    });
  }

  connection.query("INSERT INTO Bills SET ?", [newBill], function (err, data) {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      newBill.billId = data.insertId,
        res.status(201).json({ bill: newBill });
    }
  });
});

app.delete("/bills/:billId", function (req, res) {
  const id = req.params.billId;

  connection.query("DELETE FROM Bills WHERE billId=?", [id], function (err, data) {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      res.sendStatus(200);
    }
  });
});


app.put("/bills/:billId", function (req, res) {
  const updatedBill = req.body;
  const id = req.params.billId;

  connection.query("UPDATE Bills SET ? WHERE billId=?", [updatedBill, id], function (err, data) {
    if (err) {
      res.status(500).json({ error: err })
    } else {
      res.status(200).json({ data: data });
    }
  });
});

app.get("/bills/reminders", function (req, res) {
  connection.query("SELECT billId, emailAdd, billProvider, DATE_FORMAT(renewalDate, '%Y-%m-%d') AS expiryDate FROM Bills WHERE DATE_FORMAT(renewalDate, '%Y-%m-%d') = CURDATE()", function (err, data) {
    if (err) {
      res.status(500).json({ error: err })
    } else {
      let resume = [];

      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey('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');

      data.forEach((bill) => {

        const msg = {
          to: bill.emailAdd,
          from: 'info@carloscastillo.cl',
          subject: 'You have a bill that will expire shortly',
          text: 'Your bill with ' + bill.billProvider + ' will expire on ' + bill.expiryDate + '. Don`t forget to shop around to save money or renew with ' + bill.billProvider + '.',
          html: '<strong>Your bill with ' + bill.billProvider + ' will expire on ' + bill.expiryDate + '. Don`t forget to shop around to save money or renew with ' + bill.billProvider + '. </strong>'
        };
        sgMail
          .send(msg)
          .then(() => { res.sendStatus(200) }, console.error);

      });
    }
  });
});


module.exports.handler = serverless(app);