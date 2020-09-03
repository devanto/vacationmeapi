// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
const {sendgridKey} = require ('../config/env.config');
const db = require("../models");
const User = db.user;



exports.sendVerificationMail =(to, token) => {


sgMail.setApiKey(sendgridKey);
console.log(process.env.SENDGRID_API_KEY);
const msg = {
  to: to,
  from: 'anto@vacasstionme.net    ',
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
    return User.find({
      where: { email: req.query.email }
    })
      .then(user => {
        if (user.emailverified) {
          return res.status(202).json(`Email Already Verified`);
        } else {
          return models.VerificationToken.find({
            where: { token: req.query.verificationToken }
          })
            .then((foundToken) => {
              if(foundToken){
                return user
                  .update({ emailverified: true })
                  .then(updatedUser => {
                    return res.status(403).json(`User with ${user.email} has been verified`);
                  })
                  .catch(reason => {
                    return res.status(403).json(`Verification failed`);
                  });
              } else {
                return res.status(404).json(`Token expired` );
              }
            })
            .catch(reason => {
              return res.status(404).json(`Token expired`);
            });
        }
      })
      .catch(reason => {
        return res.status(404).json(`Email not found`);
      });
    
    }