import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { GameManager__factory, GameManager } from "../typechain-types";

describe("GameManager", function () {
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const accounts = await ethers.getSigners();

    const GameManagerFactory = await ethers.getContractFactory("GameManager");
    const gameManager = (await GameManagerFactory.deploy()) as GameManager;

    return { gameManager, accounts };
  }

  describe("testing", function () {
    it("Should add admin and remove", async function () {
      const { gameManager, accounts } = await loadFixture(
        deployOneYearLockFixture
      );
      await gameManager.addAmin(accounts[1].address);
      expect(await gameManager.admins(accounts[1].address)).to.equal(true);
      await gameManager.connect(accounts[1]).removeAdmin(accounts[1].address);
      expect(await gameManager.admins(accounts[1].address)).to.equal(false);
    });

    it("Should create, and update game", async function () {
      const { gameManager, accounts } = await loadFixture(
        deployOneYearLockFixture
      );
      const timestamp = Date.now() + 1000;
      await gameManager.createGame(timestamp, 100);
      let { startTime, buyIn } = await gameManager.games(0);
      expect(buyIn).to.equal(100);
      expect(startTime).to.equal(timestamp);

      await gameManager.updateGamePrice(0, timestamp + 1000);
      await gameManager.updateGameBuyIn(0, 200);
      const data = await gameManager.games(0);
      expect(data.buyIn).to.equal(200);
      expect(data.startTime).to.equal(timestamp + 1000);
    });

    it("Should create, register and update player", async function () {
      const { gameManager, accounts } = await loadFixture(
        deployOneYearLockFixture
      );
      const timestamp = Date.now() + 1000;
      await gameManager.createGame(timestamp, 100);
      let { startTime, buyIn } = await gameManager.games(0);
      expect(buyIn).to.equal(100);
      expect(startTime).to.equal(timestamp);

      await gameManager.createPlayer("ipfs://hash");
      await gameManager.registerToTheGame(0);
      gameManager.regisrations(0, accounts[0].address);
      const player = await gameManager.players(accounts[0].address);
      expect(player.uri).to.equal("ipfs://hash");
      expect(await gameManager.regisrations(0, accounts[0].address)).to.equal(
        true
      );
      console.log(ethers.utils.parseUnits("1", "ether"));
      expect(
        await gameManager.topUp({
          value: ethers.utils.parseUnits("1", "ether"),
        })
      ).to.changeEtherBalance(accounts[0], "-1");
    });
  });

  //   it("Should set the right owner", async function () {
  //     const { lock, owner } = await loadFixture(deployOneYearLockFixture);

  //     expect(await lock.owner()).to.equal(owner.address);
  //   });

  //   it("Should receive and store the funds to lock", async function () {
  //     const { lock, lockedAmount } = await loadFixture(
  //       deployOneYearLockFixture
  //     );

  //     expect(await ethers.provider.getBalance(lock.address)).to.equal(
  //       lockedAmount
  //     );
  //   });

  //   it("Should fail if the unlockTime is not in the future", async function () {
  //     // We don't use the fixture here because we want a different deployment
  //     const latestTime = await time.latest();
  //     const Lock = await ethers.getContractFactory("Lock");
  //     await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
  //       "Unlock time should be in the future"
  //     );
  //   });
  // });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
});
