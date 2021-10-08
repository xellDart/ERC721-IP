## ERC721 using eip712 for intellectual property

#### EIP-721: Non-Fungible Token Standard

##### Simple Summary

A standard interface for non-fungible tokens, This implementation is based on the generation of tokens where each id is related to an EIP712 implementation.

##### How works?

The modifications made to the erc721 standard are the change of the token id (uint256) by bytes32

```solidity
// Mapping from token ID to owner address
 mapping(bytes32 => address) private _owners;
```

This allows us to make assignments of the EIP712 message result

##### EIP 712 

Base structure:

```javascript
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
```

The structure is defined from the example in the official EIP, where Person corresponds to two entities and IPP contains key information of a record, the title, the creation date and the sum of sha512 verifications of each registered file.

Example using IPP structure:

```javascript
const ip = await IPPBlock.deployed();
// init wallet for testing
const signer = new ethers.Wallet('0x6639fb3d97a571cb253589fddf53edc8d331eab7ac36c45423074ef55d96aba0');

// get current date in long formant
let date = new Date();
let creation = date.getTime();

// sha512 checksum from ip files
const contents = [
      '210aae6c8f9c7c4b23ee2cd0471c75ac7621076136d97f187a9580a93eb1817c3d7bb9f8dbb7426e33f7d60f27b75ede867ff83b3301a8a5b249f92591c88ece',
      '210aae6c8f9c7c4b23ee2cd0471c75ac7621076136d97f187a9580a93eb1817c3d7bb9f8dbb7426e33f7d60f27b75ede867ff83b3301a8a5b249f92591c88ece'
];

// message creation with information from IPP
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
		contents: contents
};

// get EIP712 signature using etherjs
const signature = await signer._signTypedData(domain, types, value);

// contract can verify certifications signatures
let owner = await ip.recoverSigner(
	signer.address,
	ethers.utils.formatBytes32String('Certification title'),
	ethers.BigNumber.from(creation),
	contents,
	signature);
	
assert.equal(owner, signer.address, "invalid signature");

// get symbol for deployed contract
assert.equal(await ip.symbol(), 'IPP', "invalid symbol");

// get if account has already certifications
let certs = await ip.balanceOf(signer.address);
assert.equal(balance.toNumber(), 0, "invalid balance");

// create new signature as ERC721 token
await ip.mint(signer.address,
	ethers.utils.formatBytes32String('Certification title'),
	ethers.BigNumber.from(creation),
	contents);
	
// get new account certifications
let certs = await ip.balanceOf(signer.address);
assert.equal(balance.toNumber(), 0, "invalid balance");

// calculate digest for curren EIP message
let digest = await ip.generateDigest(signer.address,
	ethers.utils.formatBytes32String('Certification title'),
	ethers.BigNumber.from(creation),
	contents);
	
// get owner from certificate
let tokenOwner = await ip.ownerOf(digest);
assert.equal(tokenOwner, signer.address, "invalid owner");
```

Every signature can share to other user

TODO:
Recalculate signature on trnasfer