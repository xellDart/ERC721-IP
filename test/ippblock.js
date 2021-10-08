const IPPBlock = artifacts.require("IPPBlock");
const { ethers } = require("ethers");

const domain = {
  name: 'IPPBlock Certification',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};

const types = {
  Person: [
    { name: 'name', type: 'bytes32' },
    { name: 'wallet', type: 'address' },
  ],
  IPP: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'title', type: 'bytes32' },
    { name: 'creation', type: 'uint' },
    { name: 'contents', type: 'string[]' },
  ]
};

//truffle test --show-events

contract('IPPBlock', (accounts) => {
  it('Test ippblock signature', async () => {
    const ip = await IPPBlock.deployed();
    const signer = new ethers.Wallet('0x6639fb3d97a571cb253589fddf53edc8d331eab7ac36c45423074ef55d96aba0');
    let date = new Date();
    let creation = date.getTime();

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
      to: {
        name: ethers.utils.formatBytes32String('Owner'),
        wallet: signer.address
      },
      title: ethers.utils.formatBytes32String('Certification title'),
      creation: ethers.BigNumber.from(creation),
      contents: contents,
    };

    const signature = await signer._signTypedData(domain, types, value);

    let owner = await ip.recoverSigner(
      signer.address,
      ethers.utils.formatBytes32String('Certification title'),
      ethers.BigNumber.from(creation),
      contents,
      signature);

    assert.equal(await ip.symbol(), 'IPP', "invalid symbol");


    assert.equal(owner, signer.address, "invalid signature");

    let balance = await ip.balanceOf(signer.address);
    assert.equal(balance.toNumber(), 0, "invalid balance");

    await ip.mint(signer.address,
      ethers.utils.formatBytes32String('Certification title'),
      ethers.BigNumber.from(creation),
      contents);

    balance = await ip.balanceOf(signer.address);
    assert.equal(balance.toNumber(), 1, "invalid balance");

    let digest = await ip.generateDigest(signer.address,
      ethers.utils.formatBytes32String('Certification title'),
      ethers.BigNumber.from(creation),
      contents);

    let tokenOwner = await ip.ownerOf(digest);
    assert.equal(tokenOwner, signer.address, "invalid owner");
  });
});