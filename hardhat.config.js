require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
const privateKey = fs.readFileSync(".secret").toString().trim();
const infuraId = fs.readFileSync(".infuraid").toString().trim();

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${infuraId}`,
      accounts: [
        "7b51731b80a01091a202de513a90fca781e9beccd51cfa9eae7fadcf698e384e",
      ],
    },
    matic: {
      url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
      accounts: [
        "7b51731b80a01091a202de513a90fca781e9beccd51cfa9eae7fadcf698e384e",
      ],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
