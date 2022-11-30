import { ethers } from "hardhat";
import { GameManager } from "../typechain-types";

// account 1 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 BigNumber { value: "10000000000000000000000" }
// account 2 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 BigNumber { value: "10000000000000000000000" }
// account 3 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC BigNumber { value: "10000000000000000000000" }
async function main() {
  const accounts = await ethers.getSigners();
  console.log("*********************ACCOUNTS*********************************");
  console.log("account 1", accounts[0].address, await accounts[0].getBalance());
  console.log("account 2", accounts[1].address, await accounts[1].getBalance());
  console.log("account 3", accounts[2].address, await accounts[2].getBalance());

  console.log("*******************PAYMANT TOKEN******************************");

  const GameManagerFactory = await ethers.getContractFactory("GameManager");
  const gameManager = (await GameManagerFactory.deploy()) as GameManager;

  await gameManager.deployed();

  console.log(await gameManager.admins(accounts[1].address));
  await gameManager.addAmin(accounts[1].address);
  console.log(await gameManager.admins(accounts[1].address));
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
