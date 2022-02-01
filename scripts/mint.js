const hre = require("hardhat");

const { ART } = require("./utils/categories");

const [nftaddress, coinaddress] = [
  "0xE3b16610b19134df2f36bac972CE70c94C8d690a",
  "0xe911859593212F038d50d962d404E85Fb6024F57",
];

const ethers = hre.ethers;

async function main() {
  const ERC721 = await ethers.getContractFactory("ArtisanERC721");
  const erc721 = await ERC721.attach(nftaddress);

  await erc721.mint(
    "http://127.0.0.1:8080/blue_woman_nft.png",
    ART,
    coinaddress,
    100,
    ethers.utils.parseEther("1")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/castle_nft.png",
    ART,
    coinaddress,
    200,
    ethers.utils.parseEther("2")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/fox_nft.png",
    ART,
    coinaddress,
    300,
    ethers.utils.parseEther("3")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/goddess_nft.png",
    ART,
    coinaddress,
    400,
    ethers.utils.parseEther("4")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/jaquuess_nft.png",
    ART,
    coinaddress,
    500,
    ethers.utils.parseEther("5")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/kendrick_lamar_nft.png",
    ART,
    coinaddress,
    600,
    ethers.utils.parseEther("6")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/kush_nft.png",
    ART,
    coinaddress,
    700,
    ethers.utils.parseEther("7")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/moonchild_nft.png",
    ART,
    coinaddress,
    800,
    ethers.utils.parseEther("8")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/night_sky_nft.png",
    ART,
    coinaddress,
    900,
    ethers.utils.parseEther("9")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/shiva_blue_nft.png",
    ART,
    coinaddress,
    1000,
    ethers.utils.parseEther("10")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/the_man_in_the_distance_nft.png",
    ART,
    coinaddress,
    900,
    ethers.utils.parseEther("9")
  );
  await erc721.mint(
    "http://127.0.0.1:8080/yessir_nft.png",
    ART,
    coinaddress,
    800,
    ethers.utils.parseEther("8")
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
