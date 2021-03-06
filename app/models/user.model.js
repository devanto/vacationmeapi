module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        username: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,          
        },
        email: {
            type: Sequelize.STRING
        },
        phone:{
            type: Sequelize.STRING
        },
        token: {
          type: Sequelize.STRING          
        },
        phoneverified: {
           type: Sequelize.BOOLEAN,
           defaultValue: false
        },
        emailverified : {
          type: Sequelize.BOOLEAN,
          defaultValue: false
       },
       isactive : {
        type: Sequelize.BOOLEAN,
        defaultValue: false
       },
       provider : {
        type: Sequelize.STRING
          }

          });
  
    return User;
  };

  