const hre = require("hardhat");
const fs = require("fs");

const ethers = hre.ethers;
const supply = 3e24;

async function main() {
  const ERC721 = await ethers.getContractFactory("ArtisanERC721");
  const erc721 = await ERC721.deploy();
  await erc721.deployed();
  console.log("nft deployed to:", erc721.address);

  const ERC20 = await ethers.getContractFactory("ArtisanERC20");
  const erc20 = await ERC20.deploy(
    supply.toLocaleString("fullwide", { useGrouping: false })
  );
  await erc20.deployed();
  console.log("coin deployed to:", erc20.address);

  let config = `export const nftaddress = "${erc721.address}";\nexport const coinaddress = "${erc20.address}";`;

  let data = JSON.stringify(config);
  fs.writeFileSync("config.js", JSON.parse(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
