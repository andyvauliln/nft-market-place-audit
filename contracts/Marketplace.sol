// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Rewardable {
     struct Reward {
        uint256 timestamp;
        uint256 amount;
    }
    
    event RewardsClaimed(address indexed seller, uint256 amount);
    error NothingForClaim();
   
    uint256 private constant _PCT_DENOMINATOR = 1000;
    uint256 private constant _SEED = 335813536577843457;

    IERC20 internal _PAYMENT_TOKEN;
    IERC20 internal _REWARD_TOKEN;
    uint256 public _rewardsAmount;

    mapping(address => Reward[]) internal _rewards;  // user => reward

    constructor(address rewardToken, address paymentToken) {
        _REWARD_TOKEN = IERC20(rewardToken);
        _PAYMENT_TOKEN = IERC20(paymentToken);
    }

    function claimReward() external {
        uint256 length = _rewards[msg.sender].length;
        if (length == 0) revert NothingForClaim();

        for (uint256 i = 0; i < length;) {
            Reward memory reward = _rewards[msg.sender][length - 1];
            withdrawLastDeposit(msg.sender, reward.amount);
            payRewards(msg.sender, reward);

            unchecked {
                ++i;
            }
        }
      
        delete _rewards[msg.sender];
    }

    function payRewards(address seller, Reward memory reward) internal {
        uint256 random = uint256(
            keccak256(abi.encodePacked(block.timestamp, _SEED))
        );
        uint256 daysDelta = (block.timestamp - reward.timestamp) / 1 days;

        if(daysDelta != 0){
            uint256 sellerReward = (reward.amount / _PCT_DENOMINATOR) * (random % daysDelta) == 0 ? 1 : (random % daysDelta);
            _REWARD_TOKEN.transfer(seller, sellerReward);
            emit RewardsClaimed(seller, sellerReward);
        }
    }

    function withdrawLastDeposit(address seller, uint256 amount) internal {
        _rewards[seller].pop();

        _rewardsAmount -= amount;
        _PAYMENT_TOKEN.transfer(seller, amount);
    }

    function depositForRewards(
        address seller,
        address buyer,
        uint256 amount
    ) internal {
        _PAYMENT_TOKEN.transferFrom(buyer, address(this), amount);
        _rewardsAmount += amount;

        _rewards[seller].push(Reward(block.timestamp, amount));
    }
}

contract Marketplace is Rewardable {
    using SafeMath for uint256;

    struct SaleItem {
        address seller;
        uint256 price;
        uint256 startTime;
    }   
   
    IERC721 internal _NFT_TOKEN;
    mapping(uint256 => SaleItem) public _saleItems; // nft tokenId => item

    event SetForSale(address indexed seller, uint256 indexed tokenId, uint256 price, uint256 startTime);
    event DiscardFromSale(address indexed seller, uint256 indexed tokenId);
    event UpdatePrice(address indexed seller, uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);
    event PostponeSale(address indexed seller, uint256 indexed tokenId, uint256 newStartTime);
    event Buy(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);

    error AlreadyOwner();
    error NotItemOwner();
    error InvalidSale(string message);
    error AlreadyOnSale();

    modifier nftOwnerOnly(uint256 tokenId) {
      require(_NFT_TOKEN.ownerOf(tokenId) == msg.sender, "only nft owner");
      _;
    }

    constructor(
        address nftToken,
        address paymentToken,
        address rewardToken
    ) Rewardable(rewardToken, paymentToken) {
        _NFT_TOKEN = IERC721(nftToken);
    }

    function setForSale(
        uint256 tokenId,
        uint256 price,
        uint256 startTime
    ) external nftOwnerOnly(tokenId) {
        if (_saleItems[tokenId].startTime > 0) revert AlreadyOnSale();
        if (block.timestamp > startTime) revert InvalidSale("token sale time should be greater than current time");
       

        _saleItems[tokenId] = SaleItem(msg.sender, price, startTime);
        emit SetForSale(msg.sender, tokenId, price, startTime);
    }

    function discardFromSale(uint256 tokenId) external nftOwnerOnly(tokenId) {
        delete _saleItems[tokenId];
        emit DiscardFromSale(msg.sender, tokenId);
    }
    function updatePrice(uint256 tokenId, uint256 newPrice) external  nftOwnerOnly(tokenId) {
        SaleItem storage sale = _saleItems[tokenId];
        if(sale.price == newPrice) revert InvalidSale("new price should not be equal to old price");


        assembly {
            let s := add(sale.slot, 1)
            sstore(s, add(sload(s), newPrice))
        }
        emit UpdatePrice(msg.sender, tokenId, sale.price, newPrice );
    }

    function postponeSale(uint256 tokenId, uint256 postponeSeconds) external  nftOwnerOnly(tokenId) {
        SaleItem storage sale = _saleItems[tokenId];
        if (block.timestamp > sale.startTime + postponeSeconds ) 
        revert InvalidSale("new token sale time should be greater than current time");
        assembly {
            let s := add(sale.slot, 2)
            sstore(s, add(sload(s), postponeSeconds))
        }
        emit PostponeSale(msg.sender, tokenId, sale.startTime);
    }

    function buy(uint256 tokenId) external {
        address seller = _NFT_TOKEN.ownerOf(tokenId);
        if (seller == msg.sender) revert AlreadyOwner();
        SaleItem memory sale = _saleItems[tokenId];
        if (block.timestamp < sale.startTime) revert InvalidSale("token not for sale yet");

        if (sale.seller == address(0) ||
            _saleItems[tokenId].seller == msg.sender
        ) revert InvalidSale("token dosn't exist or sender already own it");

        depositForRewards(seller, msg.sender, sale.price);
        _NFT_TOKEN.transferFrom(seller, msg.sender, tokenId);
        emit Buy(seller, msg.sender, tokenId, sale.price);
        delete _saleItems[tokenId];
    }
}
