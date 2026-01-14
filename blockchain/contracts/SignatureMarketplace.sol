// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SignatureMarketplace
 * @dev Marketplace for buying and selling Signature NFTs
 */
contract SignatureMarketplace is ReentrancyGuard {
    
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
    }

    IERC721 public nftContract;
    
    // mapping from tokenId to Listing
    mapping(uint256 => Listing) public listings;

    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCanceled(uint256 indexed tokenId, address indexed seller);

    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }

    /**
     * @dev List an NFT for sale. Requires the marketplace to be approved.
     */
    function listNFT(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be at least 1 wei");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nftContract.isApprovedForAll(msg.sender, address(this)) || 
            nftContract.getApproved(tokenId) == address(this), 
            "Marketplace not approved"
        );

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    /**
     * @dev Buy a listed NFT
     */
    function buyNFT(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        listing.isActive = false;

        // Transfer NFT to buyer
        nftContract.safeTransferFrom(seller, msg.sender, tokenId);

        // Transfer funds to seller
        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "Transfer to seller failed");

        emit NFTSold(tokenId, seller, msg.sender, listing.price);
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");

        listing.isActive = false;
        emit ListingCanceled(tokenId, msg.sender);
    }

    /**
     * @dev Get current listing price
     */
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
}
