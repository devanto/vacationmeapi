module.exports = (sequelize, Sequelize) => {
    const VerificationToken = sequelize.define("verificationtoken", {
        userId: {
        type: Sequelize.INTEGER,        
      },
      token: {
        type: Sequelize.STRING
      }
    });
  
    return VerificationToken;
  };