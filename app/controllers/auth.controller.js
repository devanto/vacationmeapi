const db = require("../models");
const config = require("../config/auth.config");
const {sendVerificationMail} = require("./emailVerify.controller");
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
        token: crypto({length: 10, type: 'url-safe'})
      }).then((result) => {
        sendVerificationMail(user.email, result.token);
        res.send({ message: "User was registered successfully!" });
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
        return res.status(404).send({ message: "User Not found." });
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
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};