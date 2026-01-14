
const hre = require("hardhat");

async function main() {
    console.log("Deploying SignatureNFT...");
    const SignatureNFT = await hre.ethers.getContractFactory("SignatureNFT");
    const nft = await SignatureNFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`SignatureNFT deployed to: ${nftAddress}`);

    console.log("Deploying SignatureMarketplace...");
    const SignatureMarketplace = await hre.ethers.getContractFactory("SignatureMarketplace");
    const marketplace = await SignatureMarketplace.deploy(nftAddress);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log(`SignatureMarketplace deployed to: ${marketplaceAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
