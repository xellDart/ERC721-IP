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

In Blcockhain layer, we hace useful functions for validate and generate signatures, for example:

```solidity
// This function creates in memory data structure for hashing or validate certification;
function createIP(bytes32 title, string[] memory contents)
    internal
    pure
    returns (IPP memory)
{
	IPP memory ip = IPP({
		from: Issuer({
			name: "IPPBlock",
            wallet: 0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF
        }),
        title: title,
        contents: contents
    });
    return ip;
}
```

For validate certification, we need recover original address in signature, and compare this wit owner of current token.
Every NFT ID is the result from hashin EIP 712 data structure

For validation we need to pass checksums from original files, signature generated and title of register;

```solidity

// Signature methods

function splitSignature(bytes memory sig)
    internal
    pure
    returns (
        uint8,
        bytes32,
        bytes32
    )
{
    require(sig.length == 65);

    bytes32 r;
    bytes32 s;
    uint8 v;

     assembly {
        // first 32 bytes, after the length prefix
        r := mload(add(sig, 32))
        // second 32 bytes
        s := mload(add(sig, 64))
        // final byte (first byte of the next 32 bytes)
        v := byte(0, mload(add(sig, 96)))
    }

    return (v, r, s);
}

// Validate signature
function recoverSigner(
    bytes32 _title,
    string[] memory _contents,
    bytes memory _signature
) public view returns (address) {
    uint8 v;
    bytes32 r;
    bytes32 s;

    IPP memory ip = createIP(_title, _contents);

    (v, r, s) = splitSignature(_signature);

    return verify(ip, v, r, s);
}
```

For generate NFT ID we use digest:

```solidity

function generateDigest(bytes32 _title, string[] memory _contents)
    public
    view
    returns (bytes32)
{
    IPP memory ip = createIP(_title, _contents);

    bytes32 tokenId = sign(ip);
    return tokenId;
}
```

and for NFT creation:

```solidity
function mint(
    address _owner,
    bytes32 _title,
    string[] memory _contents
) public onlyOwner {
    IPP memory ip = createIP(_title, _contents);
    bytes32 tokenId = sign(ip);
    _safeMint(_owner, tokenId);
}
```

In short words, we use digest generated using EIP 712 for NFT ID, and we provider methods for validation of digest;


Every signature can share to other user