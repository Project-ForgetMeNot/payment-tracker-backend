const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "bills"
});

module.exports.handler = () => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT billId, emailAdd, billProvider, DATE_FORMAT(renewalDate, '%Y-%m-%d') AS expiryDate FROM Bills WHERE DATE_FORMAT(renewalDate, '%Y-%m-%d') = CURDATE()", function (err, data) {
      if (err) {
        reject(err);

      } else {

        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey('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');

        const billEmailsToSend = [];
        data.forEach((bill) => {
          const msg = {
            to: bill.emailAdd,
            from: 'bills@forgetmenot.com',
            subject: 'A bill is about to expire...',
            text: 'Your bill with ' + bill.billProvider + ' will expire on ' + bill.expiryDate + '. Don`t forget to shop around to save money or renew with ' + bill.billProvider + '.',
            html: '<strong>Your bill with ' + bill.billProvider + ' will expire on ' + bill.expiryDate + '. Don`t forget to shop around to save money or renew with ' + bill.billProvider + '. </strong>'
          };

          billEmailsToSend.push(sgMail.send(msg))
        });

        Promise.all(billEmailsToSend)
          .then(() => {
            resolve();
          });
      }
    });
  });
};