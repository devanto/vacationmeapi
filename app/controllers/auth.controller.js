const axios = require('axios')
const db = require("../models");
const config = require("../config/auth.config");
const { sendVerificationMail } = require("./emailVerify.controller");
const { OAuth2Client } = require('google-auth-library');
const User = db.user;
const Role = db.role;
const VerificationToken = db.verificationtoken;
const Op = db.Sequelize.Op;




var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var crypto = require("crypto-random-string");

exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 8),
    email: req.body.email,
    phone: req.body.phone,
    provider: 'vme'
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            // sendVerificationMail(user.email,user.token);
            //  res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          // sendVerificationMail(user.email,user.token);
          // res.send({ message: "User was registered successfully!" });
        });
      }

      VerificationToken.create({
        userId: user.id,
        token: crypto({ length: 10, type: 'url-safe' })
      }).then(async (result) => {
        await sendVerificationMail(req.body.username, result.token);
        res.send({ message: "User registered successfully!"});
      })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });

    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.send({ message: "User Not found. Please sign up" });
      }

      if (!user.password){
        return res.send({ message: "Please sign in using "+user.provider });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          emailverified: user.emailverified,
          phoneverified: user.phoneverified,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.googleauth = (req, res) => {
  const CLIENT_ID = '169941163895-piqfvne1ade18du4r7g62khrho4f9v0p.apps.googleusercontent.com'
  const client = new OAuth2Client(CLIENT_ID);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: req.body.id_token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend

    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return payload;
  }
  verify()
    .then(async data => {
      const [user, created] = await User.findOrCreate({
        where: { 
          username: data.email 
        },
        defaults: {
          email: data.email,
          emailverified: true,
          provider: 'google'
        }
      });     
      console.log(created); // The boolean indicating whether this instance was just created
      if (created) {
        user.setRoles([1]).then(() => {           
          console.log({ message: "User was registered successfully!" });
         });
      }

          var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
          });

          var authorities = [];
          user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
            res.status(200).send({
              id: user.id,
              username: user.username,
              phone: user.phone,
              email: user.email,
              emailverified: user.emailverified,
              phoneverified: user.phoneverified,             
              accessToken: token
            });
          });
        })
      
    .catch(console.error);
}

//app secret 57346744f51a1dbb8a552fc3cf52ae73
const appid = 738433613663934;
//curl -X GET "https://graph.facebook.com/oauth/access_token?client_id={738433613663934}&client_secret={57346744f51a1dbb8a552fc3cf52ae73}&grant_type=client_credentials"


exports.fbauth = (req, res) => {
axios.get("https://graph.facebook.com/oauth/access_token?client_id=738433613663934&client_secret=57346744f51a1dbb8a552fc3cf52ae73&grant_type=client_credentials")
.then(result => {
axios.get(`https://graph.facebook.com/debug_token?input_token=${req.body.accessToken}&access_token=${result.data.access_token}`)
.then(async () => { 
  if(result.data.user_id === req.body.uid && appid === result.data.app_id);{
    const [user, created] = await User.findOrCreate({
      where: { 
        username: req.body.email
      },
      defaults: {
        email: req.body.email,
        emailverified: true,
        provider: 'facebook'
      }
    });     
    console.log(created); // The boolean indicating whether this instance was just created
    if (created) {
      user.setRoles([1]).then(() => {           
        console.log({ message: "User was registered successfully!" });
       });
    }

        var token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400 // 24 hours
        });

        var authorities = [];
        user.getRoles().then(roles => {
          for (let i = 0; i < roles.length; i++) {
            authorities.push("ROLE_" + roles[i].name.toUpperCase());
          }
          res.status(200).send({
            id: user.id,
            username: user.username,
            phone: user.phone,
            email: user.email,
            emailverified: user.emailverified,
            phoneverified: user.phoneverified,             
            accessToken: token
          });
        });
  }
 
}).catch(err => {
  console.log(err);
 });

}).catch(err => {
 console.log(err);
});
}