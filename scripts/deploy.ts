import { ethers } from "hardhat";

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

  const PaymentToken = await ethers.getContractFactory("PaymentToken");
  const pt = await PaymentToken.deploy();

  await pt.deployed();

  console.log("PaymentToken deployed to:", pt.address); //0x5FbDB2315678afecb367f032d93F642f64180aa3
  console.log(accounts[0].address, await pt.balanceOf(accounts[0].address));
  console.log(accounts[1].address, await pt.balanceOf(accounts[1].address));
  console.log(accounts[2].address, await pt.balanceOf(accounts[2].address));

  console.log("*****************Rewardable TOKEN****************************");

  const RewardableToken = await ethers.getContractFactory("RewardableToken");
  const rt = await RewardableToken.deploy();

  await rt.deployed();

  console.log("Rewardable deployed to:        ", rt.address); //0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  console.log(accounts[0].address, await rt.balanceOf(accounts[0].address));
  console.log(accounts[1].address, await rt.balanceOf(accounts[1].address));
  console.log(accounts[2].address, await rt.balanceOf(accounts[2].address));

  console.log("*********************NFT TOKEN*****************************");
  const NftToken = await ethers.getContractFactory("NftToken");
  const nt = await NftToken.deploy();

  await nt.deployed();

  console.log("NFT deployed to:        ", nt.address); //0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  console.log(accounts[0].address, await nt.balanceOf(accounts[0].address));
  console.log(accounts[1].address, await nt.balanceOf(accounts[1].address));
  console.log(accounts[2].address, await nt.balanceOf(accounts[2].address));

  console.log("********************* MARKETPLACE **************************");
  const Marketplace = await ethers.getContractFactory("Marketplace"); //0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
  const marketplace = await Marketplace.deploy(
    nt.address,
    pt.address,
    rt.address
  );

  const r6 = marketplace.deployed();
  console.log(
    "Gas Used for deployment: ",
    await ethers.provider.estimateGas(
      Marketplace.getDeployTransaction(nt.address, pt.address, rt.address).data
    )
  );

  console.log("Marketplace deployed to:       ", marketplace.address); //0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  console.log("_rewardsAmount", await marketplace._rewardsAmount());
  console.log("items", await marketplace._saleItems(0));

  console.log("********************* SALE **************************");
  const currentBlock = await ethers.provider.getBlockNumber();
  const blockTimestamp = (await ethers.provider.getBlock(currentBlock))
    .timestamp;

  const r3 = (
    await marketplace
      .connect(accounts[0])
      .setForSale(0, 1000, blockTimestamp + 1)
  ).hash;

  await nt.connect(accounts[0]).approve(marketplace.address, 0);

  //*********Logging********
  console.log(
    "Gas Used for setForSale",
    await (
      await ethers.provider.getTransactionReceipt(r3)
    ).gasUsed
  );
  console.log("_rewardsAmount", await marketplace._rewardsAmount());
  console.log("items", await marketplace._saleItems(0));

  console.log("********************* BUY **************************");
  await pt.connect(accounts[1]).approve(marketplace.address, 1000);

  const r5 = await (await marketplace.connect(accounts[1]).buy(0)).hash;

  //*********Logging********
  console.log(
    "Gas Used for Buy",
    await (
      await ethers.provider.getTransactionReceipt(r5)
    ).gasUsed
  );
  console.log("_rewardsAmount", await marketplace._rewardsAmount(), 1000);
  console.log("_saleItems", await marketplace._saleItems(0), 0);
  console.log(
    await nt.ownerOf(0),
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );
  console.log(
    marketplace.address,
    await pt.balanceOf(marketplace.address),
    "+1000"
  );
  console.log(
    accounts[1].address,
    await pt.balanceOf(accounts[1].address),
    "-1000)"
  );

  console.log("********************* CLAIM **************************");
  const r4 = await (await marketplace.connect(accounts[0]).claimReward()).hash;

  //*********Logging********
  console.log(
    "Gas Used for claim",
    await (
      await ethers.provider.getTransactionReceipt(r4)
    ).gasUsed
  );
  console.log("_rewardsAmount", await marketplace._rewardsAmount(), 0);
  console.log(
    "paymant token marketplace",
    marketplace.address,
    await pt.balanceOf(marketplace.address),
    "0"
  );
  console.log(
    "paymant token accounts[0]",
    accounts[0].address,
    await pt.balanceOf(accounts[0].address),
    "+1000)"
  );
  console.log(
    "rewardable token marketplace",
    marketplace.address,
    await rt.balanceOf(marketplace.address),
    "-1000"
  );
  console.log(
    "rewardable token accounts[0]",
    accounts[0].address,
    await rt.balanceOf(accounts[0].address),
    "+1000)"
  );

  console.log(
    "********************* POSTFHONE, UPDATE, DISCARD SALE **************************"
  );
  const currentBlock2 = await ethers.provider.getBlockNumber();
  const blockTimestamp2 = (await ethers.provider.getBlock(currentBlock2))
    .timestamp;

  await marketplace
    .connect(accounts[0])
    .setForSale(1, 1000, blockTimestamp2 + 1);

  await nt.connect(accounts[0]).approve(marketplace.address, 1);
  console.log("_saleItems 1 before discard", await marketplace._saleItems(1));

  console.log("*************** POSTPHONE SALE *******************");
  const r2 = await (
    await marketplace.postponeSale(
      1,
      ethers.BigNumber.from("18446744073709551615")
    )
  ).hash;
  console.log(
    "Gas Used for postponeSale",
    await (
      await ethers.provider.getTransactionReceipt(r2)
    ).gasUsed
  );

  console.log("*************** UPDATE PRICE *******************");
  console.log(
    "_saleItems 1 before update Price",
    await marketplace._saleItems(1)
  );
  const r7 = await (
    await marketplace.updatePrice(
      1,
      ethers.BigNumber.from("18446744073709551615")
    )
  ).hash;
  console.log(
    "Gas Used for update Price",
    await (
      await ethers.provider.getTransactionReceipt(r7)
    ).gasUsed
  );
  console.log(
    "_saleItems 1 after update Price",
    await marketplace._saleItems(1)
  );

  console.log("*************** DISCARD SALE *******************");
  const r1 = await (
    await marketplace.connect(accounts[0]).discardFromSale(1)
  ).hash;
  console.log(
    "Gas Used for discardFromSale",
    await (
      await ethers.provider.getTransactionReceipt(r1)
    ).gasUsed
  );
  console.log("_saleItems 1 after discard", await marketplace._saleItems(1));
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
