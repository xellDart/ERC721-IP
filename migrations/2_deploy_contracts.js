const IPPBlock = artifacts.require("IPPBlock");

module.exports = function (deployer, network, accounts) {
  //deployer.deploy(ConvertLib);
  //deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(IPPBlock);
};
