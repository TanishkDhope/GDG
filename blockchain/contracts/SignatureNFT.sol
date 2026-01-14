// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SignatureNFT
 * @dev A premium NFT contract for Digital Signatures
 */
contract SignatureNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    event NFTMinted(uint256 indexed tokenId, string tokenURI, address artist);

    constructor() ERC721("Signature NFT", "SIG") Ownable(msg.sender) {}

    /**
     * @dev Mints a new NFT signature
     * @param tokenURI The metadata URI (containing name, artist, image, etc.)
     */
    function mintSignature(string memory tokenURI) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit NFTMinted(newItemId, tokenURI, msg.sender);

        return newItemId;
    }

    function getCurrentId() public view returns (uint256) {
        return _tokenIds;
    }
}
