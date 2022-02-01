const { expect } = require("chai");

// `describe` is a Mocha function that allows you to organize the tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of the test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Artisan ERC20 contract", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let hardhatToken;
  let owner;
  let account1;
  let account2;
  let accounts;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    const totalSupply = ethers.utils.parseEther("1000");
    // Get the ContractFactory and Signers here.
    let Token = await ethers.getContractFactory("ArtisanERC20");
    [owner, account1, account2, ...accounts] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatToken = await Token.deploy(totalSupply);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to account1
      await hardhatToken.transfer(
        account1.address,
        ethers.utils.parseEther("50")
      );
      const account1Balance = await hardhatToken.balanceOf(account1.address);
      expect(account1Balance).to.equal(ethers.utils.parseEther("50"));

      // Transfer 50 tokens from account1 to account2
      // We use .connect(signer) to send a transaction from another account
      await hardhatToken
        .connect(account1)
        .transfer(account2.address, ethers.utils.parseEther("50"));
      const account2Balance = await hardhatToken.balanceOf(account2.address);
      expect(account2Balance).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from account1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken
          .connect(account1)
          .transfer(owner.address, ethers.utils.parseEther("1"))
      ).to.be.reverted;

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Transfer 100 tokens from owner to account1.
      await hardhatToken.transfer(
        account1.address,
        ethers.utils.parseEther("100")
      );

      // Transfer another 50 tokens from owner to account2.
      await hardhatToken.transfer(
        account2.address,
        ethers.utils.parseEther("50")
      );

      // Check balances.
      const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(
        initialOwnerBalance.sub(ethers.utils.parseEther("150"))
      );

      const account1Balance = await hardhatToken.balanceOf(account1.address);
      expect(account1Balance).to.equal(ethers.utils.parseEther("100"));

      const account2Balance = await hardhatToken.balanceOf(account2.address);
      expect(account2Balance).to.equal(ethers.utils.parseEther("50"));
    });
  });
});
