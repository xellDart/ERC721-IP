pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/IPPBlock.sol";

contract TestIPPBlock {

  function testSignatureUsingDeployedContract() public {
    IPPBlock _ip = IPPBlock(DeployedAddresses.IPPBlock());
  }



}
//0x1bfd487ee38cda5953a5cf2ecb79f532a26d20b228c4c4e889eb4ef837b48e9b (type: bytes32)