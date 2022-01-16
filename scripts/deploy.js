const hre = require("hardhat");
const fs = require("fs");

const supply = 3e24;

async function main() {
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("market deployed to:", nftMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  const ArtisanCoin = await hre.ethers.getContractFactory("ArtisanCoin");
  const artisanCoin = await ArtisanCoin.deploy(
    supply.toLocaleString("fullwide", { useGrouping: false })
  );
  await artisanCoin.deployed();
  console.log("coin deployed to:", artisanCoin.address);

  let config = `export const nftmarketaddress = "${nftMarket.address}";\nexport const nftaddress = "${nft.address}";\nexport const coinaddress = "${artisanCoin.address}";`;

  let data = JSON.stringify(config);
  fs.writeFileSync("config.js", JSON.parse(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
