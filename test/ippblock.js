const IPPBlock = artifacts.require("IPPBlock");
const { ethers } = require("ethers");

const domain = {
  name: 'IPPBlock Certification',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};

const types = {
  Issuer: [
    { name: 'name', type: 'bytes32' },
    { name: 'wallet', type: 'address' },
  ],
  IPP: [
    { name: 'from', type: 'Issuer' },
    { name: 'title', type: 'string' },
    { name: 'contents', type: 'string[]' },
  ]
};

//truffle test --show-events

contract('IPPBlock', (accounts) => {
  it('Test ippblock signature', async () => {
    const ip = await IPPBlock.deployed();
    const signer = new ethers.Wallet('d3f0dfd31a6344648c5481eb59aa23e47e18638c9825e93093a048b0f63b7fa5');

    // sha512 checksum from ip files
    const contents = [
      '210aae6c8f9c7c4b23ee2cd0471c75ac7621076136d97f187a9580a93eb1817c3d7bb9f8dbb7426e33f7d60f27b75ede867ff83b3301a8a5b249f92591c88ece',
      '210aae6c8f9c7c4b23ee2cd0471c75ac7621076136d97f187a9580a93eb1817c3d7bb9f8dbb7426e33f7d60f27b75ede867ff83b3301a8a5b249f92591c88ece'
    ];

    const value = {
      from: {
        name: ethers.utils.formatBytes32String('IPPBlock'),
        wallet: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'
      },
      title: 'Certification title',
      contents: contents,
    };

    const signature = await signer._signTypedData(domain, types, value);

    let owner = await ip.recoverSigner(
      'Certification title',
      contents,
      signature);

    assert.equal(owner, signer.address, "invalid signature");

    assert.equal(await ip.symbol(), 'IPP', "invalid symbol");

    let balance = await ip.balanceOf(signer.address);
    assert.equal(balance.toNumber(), 0, "invalid balance");

    await ip.mint(signer.address,
      'Certification title',
      contents);

    balance = await ip.balanceOf(signer.address);
    assert.equal(balance.toNumber(), 1, "invalid balance");

    let digest = await ip.generateDigest(
      'Certification title',
      contents);

    let tokenOwner = await ip.ownerOf(digest);
    assert.equal(tokenOwner, signer.address, "invalid owner");
  });
});