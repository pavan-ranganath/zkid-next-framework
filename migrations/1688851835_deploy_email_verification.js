const EmailVerification = artifacts.require("EmailVerification");

module.exports = function (deployer) {
  deployer.deploy(EmailVerification);
};
