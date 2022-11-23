import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import * as tdly from "@tenderly/hardhat-tenderly";
import "hardhat-deploy-tenderly";
import "hardhat-gui";

tdly.setup({
  automaticVerifications: false,
});

const config: HardhatUserConfig = {
  tenderly: {
    project: "project",
    username: "JohnnyPitt",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.8.0",
        settings: {},
      },
    ],
  },
};

export default config;
