// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
const {sendgridKey} = require ('../config/env.config');
const db = require("../models");
const User = db.user;
const VerificationToken = db.verificationtoken;



exports.sendVerificationMail =(to, token) => {


sgMail.setApiKey(sendgridKey);

const msg = {
  to: to,
  from: 'anto@vacationme.net    ',
  subject: 'Verify your email',
  text: 'Please verify your email to continue using vacationme',
  html: `Click the link below to verify your email <br/> /verifyemail?token=${token}&email=${to}`,
};
sgMail.send(msg).then((data) => {
    if (data) {       
      return (data);
    }
}).catch(err => {  
    return (err);
  });

}


exports.emailVerificationController = (req, res) => {
  console.log(req.query.email);
    return User.findOne({
      where: { email: req.query.email }
    })
      .then(user => {
        if (user.emailverified) {
          return res.status(202).json(`Email Already Verified`);
        } else {
          return VerificationToken.findOne({
            where: { token: req.query.token }
          })
            .then((foundToken) => {
              if(foundToken){
                return user
                  .update({ emailverified: true })
                  .then(updatedUser => {
                    return res.status(403).json(`User with ${user.email} has been verified`);
                  })
                  .catch(ERR => {
                    return res.status(403).json(`Verification failed`+ERR);
                  });
              } else {
                return res.status(404).json(`Token invalid/expired` );
              }
            })
            .catch(ERR => {
              return res.status(404).json(`Token expired`+ERR);
            });
        }
      })
      .catch(ERR => {
        return res.status(404).json(`Email not found`+ERR);
      });
    
    }