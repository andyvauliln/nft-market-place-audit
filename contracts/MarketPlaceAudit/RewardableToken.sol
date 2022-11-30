// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardableToken is ERC20 {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() ERC20("REWARD TOKEN", "RWT") {
        _mint(msg.sender, 1000000000000);
        _mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 1000000000000);
        _mint(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 1000000000000);
        _mint(0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9, 1000000000000);
    }

    function rewardUser(address owner, uint256 amount) external {}
}
