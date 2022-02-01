const { expect } = require("chai");

const { ART } = require("./utils/categories");

// `describe` is a Mocha function that allows you to organize the tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of the test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Artisan ERC721 contract", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let tokenURI;
  let hardhatToken;
  let txToken;
  let owner;
  let account1;
  let account2;
  let accounts;

  // `beforeEach` will run before each test. re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    const totalSupply = ethers.utils.parseEther("1000");

    // Get the ContractFactory and Signers here.
    let Token = await ethers.getContractFactory("ArtisanERC721");
    let TxToken = await ethers.getContractFactory("ArtisanERC20");
    [owner, account1, account2, ...accounts] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatToken = await Token.deploy();
    txToken = await TxToken.deploy(totalSupply);

    // Assume the token metadata has already been deployed to IPFS.
    tokenURI = "https://ipfs.example.location/";

    // Transfer some tokens from owner to account1.
    const balance = ethers.utils.parseEther("50");
    await txToken.transfer(account1.address, balance);

    // Transfer some tokens from owner to account2.
    await txToken.transfer(account2.address, balance);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    it("Should mint a token", async function () {
      // Mint with 5% royalty (i.e. 100.00 => 10000) and for a price of 2 ether
      expect(
        await hardhatToken.mint(
          tokenURI,
          ART,
          txToken.address,
          500,
          ethers.utils.parseEther("2")
        )
      ).to.emit(hardhatToken, "Mint");
    });

    it("Should fail minting a token with higher than 10% royalties", async function () {
      // Mint with 12% royalty (i.e. 100.00 => 10000) and for a price of 2 ether
      await expect(
        hardhatToken.mint(
          tokenURI,
          ART,
          txToken.address,
          1200,
          ethers.utils.parseEther("2")
        )
      ).to.be.reverted;
    });

    it("Should set the right owner & artist", async function () {
      // Mint with 5% royalty (i.e. 100.00 => 10000) and for a price of 2 ether
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("2")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatToken.ownerOf(tokenId)).to.equal(owner.address);
      expect(await hardhatToken.artistOf(tokenId)).to.equal(owner.address);
    });

    it("Should set the right category", async function () {
      // Mint with 5% royalty (i.e. 100.00 => 10000) and for a price of 2 ether
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("2")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // This test expects the category variable stored in the contract to be
      // to the ART category imported from utils
      expect(await hardhatToken.categoryOf(tokenId)).to.equal(ART);
    });
  });

  describe("Transactions", function () {
    it("Should transfer token between accounts", async function () {
      // First mint a token as the owner and get the ID.
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("2")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // Approve the NFT contract as account1 to make transfers.
      await txToken
        .connect(account1)
        .approve(hardhatToken.address, ethers.utils.parseEther("2.1"));

      // Approve the NFT contract as account2 to make transfers.
      await txToken
        .connect(account2)
        .approve(hardhatToken.address, ethers.utils.parseEther("2.1"));

      // Transfer the token from owner to account1
      await hardhatToken.transferFrom(owner.address, account1.address, tokenId);
      let newOwner = await hardhatToken.ownerOf(tokenId);
      expect(newOwner).to.equal(account1.address);

      // Transfer the token from owner (account1) to account2
      // We use .connect(signer) to send a transaction from another account
      await hardhatToken
        .connect(account1)
        .transferFrom(account1.address, account2.address, tokenId);
      newOwner = await hardhatToken.ownerOf(tokenId);
      expect(newOwner).to.equal(account2.address);
    });

    it("Should pay royalties to the artist after every transfer", async function () {
      // Get the initial owner balance
      const initialOwnerBalance = await txToken.balanceOf(owner.address);

      // First mint a token as the owner and get the ID.
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("2")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // Approve the NFT contract as account1 to make transfers.
      await txToken
        .connect(account1)
        .approve(hardhatToken.address, ethers.utils.parseEther("2.1"));

      // Transfer the token from owner to account1
      await hardhatToken.transferFrom(owner.address, account1.address, tokenId);

      // Check the owner of the token. Should be account1.
      expect(await hardhatToken.ownerOf(tokenId)).to.equal(account1.address);

      // The owner should have 0.1 ether worth of royalties + their initial balance
      expect(await txToken.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("0.1").add(initialOwnerBalance)
      );
    });

    it("Should fail if sender doesn't own the token", async function () {
      // First mint a token as the owner and get the ID.
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("2")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // Try to send token from account1 to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken
          .connect(account1)
          .transferFrom(account1.address, owner.address, tokenId)
      ).to.be.reverted;

      // Owner shouldn't have changed.
      expect(await hardhatToken.ownerOf(tokenId)).to.equal(owner.address);
    });

    it("Should list the token as the owner", async function () {
      // First mint a token as the owner and get the ID.
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("1")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // Check for Listing event.
      expect(await hardhatToken.ownerOf(tokenId)).to.equal(owner.address);
    });

    it("Should fail if token isn't listed by the owner", async function () {
      // First mint a token as the owner and get the ID.
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("1")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // Unlist the token.
      await hardhatToken.unlist(tokenId);

      // Try to list the token as account1. Should be reverted.
      const price = ethers.utils.parseEther("1");
      await expect(hardhatToken.connect(account1).list(price, tokenId)).to.be
        .reverted;
    });

    it("Should set the ask price as the owner after minting", async function () {
      // First mint a token as the owner and get the ID.
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("1")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      const tokenAsks = await hardhatToken.asksOf(tokenId);

      // Should only be of length 1
      expect(tokenAsks.length).to.equal(1);

      // The 'asker' should be the owner
      expect(tokenAsks[0].asker).to.equal(owner.address);
    });

    it("Should unlist the token by the owner", async function () {
      // First mint a token as the owner and get the ID.
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("1")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      expect(await hardhatToken.unlist(tokenId)).to.emit(
        hardhatToken,
        "CancelListing"
      );

      const tokenBids = await hardhatToken.bidsOf(tokenId);
      const tokenAsks = await hardhatToken.asksOf(tokenId);

      // Bids and asks should be of length 0
      expect(tokenBids.length).to.equal(0);
      expect(tokenAsks.length).to.equal(0);
    });

    it("Should fail if the token isn't unlisted by the owner", async function () {
      // First mint a token as the owner and get the ID.
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("1")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // Try unlisting it as account1. Should be reverted.
      await expect(hardhatToken.connect(account1).unlist(tokenId)).to.be
        .reverted;
    });

    it("Should create an offer on the token from any account", async function () {
      // First mint a token as the owner and get the ID.
      const tx = await hardhatToken.mint(
        tokenURI,
        ART,
        txToken.address,
        500,
        ethers.utils.parseEther("2")
      );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // Set offering to 1 ether.
      const bidPrice = ethers.utils.parseEther("1");

      // Try offering as account1. Should emit an event.
      expect(
        await hardhatToken.connect(account1).offer(bidPrice, tokenId)
      ).to.emit(hardhatToken, "Offer");

      const tokenBids = await hardhatToken.bidsOf(tokenId);

      // Should add a bid to the token
      expect(tokenBids.length).to.equal(1);
      expect(tokenBids[0].bidder).to.equal(account1.address);
    });

    it("Should fail offer creation if token doesn't exist", async function () {
      // Try offering 1 ether to owner to bid on the token.
      const bidPrice = ethers.utils.parseEther("1");

      // Try offering as account1. Should be reverted.
      await expect(hardhatToken.connect(account1).offer(bidPrice, 1)).to.be
        .reverted;
    });

    it("Should create a sale on the token by the owner", async function () {
      // Mint a token as account1 and get the ID.
      const tx = await hardhatToken
        .connect(account1)
        .mint(
          tokenURI,
          ART,
          txToken.address,
          500,
          ethers.utils.parseEther("2")
        );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // Bid on the token from account2.
      const bidPrice = ethers.utils.parseEther("2");
      await hardhatToken.connect(account2).offer(bidPrice, tokenId);

      // Approve the NFT contract as account2 to make transfers.
      await txToken
        .connect(account2)
        .approve(hardhatToken.address, ethers.utils.parseEther("2.1"));

      // Try selling from account1 to account2.
      expect(
        await hardhatToken.connect(account1).sell(account2.address, tokenId)
      ).to.emit(hardhatToken, "Sale");

      // Check to see if the balance updated properly for account1.
      // Royalty should have also been paid, royalty of 2 ether is 0.1 ether.
      expect(await txToken.balanceOf(account1.address)).to.equal(
        ethers.utils.parseEther("52.1")
      );

      // Check to see if the balance updated properly for account2.
      // Royalty of 0.1 ether extra should have been deducted.
      expect(await txToken.balanceOf(account2.address)).to.equal(
        ethers.utils.parseEther("47.9")
      );

      // Check to see if the owner updated.
      expect(await hardhatToken.ownerOf(tokenId)).to.equal(account2.address);
    });

    it("Should fail if bid doesn't exist on the token", async function () {
      // Mint a token as account1 and get the ID.
      const tx = await hardhatToken
        .connect(account1)
        .mint(
          tokenURI,
          ART,
          txToken.address,
          500,
          ethers.utils.parseEther("2")
        );
      const txReceipt = await tx.wait();
      const tokenId = txReceipt.events[1].args[0].tokenId;

      // Approve the NFT contract as account2 to make transfers.
      await txToken
        .connect(account2)
        .approve(hardhatToken.address, ethers.utils.parseEther("2.1"));

      // Try selling from account1 to account2. Should be reverted
      await expect(
        hardhatToken.connect(account1).sell(account2.address, tokenId)
      ).to.be.reverted;
    });
  });
});
