// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

 //import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721 {
    // Token name
    string private _name;
    // Token symbol
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }


}

contract GameManager is ERC721 {
     
     mapping(uint64 => Game) public games;
     mapping(uint64 => mapping (address => bool)) public regisrations;
     mapping(address => Player) public players;
     mapping (address => bool) public admins;
     uint64 public gamesCounter;

    struct Player {
        uint256 level;
        uint16 wins;
        uint16 loss;
        string uri; 
    }
    struct Game {
        uint256 startTime;
        uint256 buyIn;
    }
    error PlayerAlreadyExists();
    error InvalidPlayer();
    error InvalidPaymant();
    error InvalidGame();
    error AlreadyRegistered();

    event GameCreated(uint64 indexed gameId, uint256 startTime, uint256 buyIn);


    constructor() ERC721("NFT Poker Player", "NPP") {
        admins[msg.sender] = true;
    }
    modifier onlyAdmin() {
        require(admins[msg.sender], "Only owner can call this function.");
        _;
    }

    function addAmin(address admin) public onlyAdmin {
        admins[admin] = true;
    }

    function removeAdmin(address admin) public onlyAdmin {
        admins[admin] = false;
    }

    function createGame(uint256 startTime, uint256 buyIn) external onlyAdmin {
        games[gamesCounter] = Game(startTime, buyIn);
        emit GameCreated(gamesCounter, startTime, buyIn);
        gamesCounter++;
       
    }
    function updateGamePrice(uint64 gameId, uint256 startTime) external onlyAdmin {
        games[gameId].startTime = startTime;
    }
    function updateGameBuyIn(uint64 gameId, uint256 buyIn) external onlyAdmin {
        games[gameId].buyIn = buyIn;
    }

    function createPlayer(string memory uri) external  {
        if(bytes(uri).length == 0) revert InvalidPlayer();
        if(bytes(players[msg.sender].uri).length != 0) revert PlayerAlreadyExists();

        players[msg.sender] = Player(0, 0, 0, uri);
    }

    function registerToTheGame(uint64 gameId) external {
        if(bytes(players[msg.sender].uri).length == 0) revert InvalidPlayer();
        if(regisrations[gameId][msg.sender]) revert AlreadyRegistered();
        if(games[gameId].startTime == 0) revert InvalidGame();
        //add checking for startime
        regisrations[gameId][msg.sender] = true;
    }

    function topUp() external payable {
       if(msg.value < games[gamesCounter].buyIn) revert InvalidPaymant();
       address payable to = payable(msg.sender);
       to.transfer(msg.value);
       players[msg.sender].level += msg.value;
    }

    // function updateLevel(uint256 level) external {
    //     players[msg.sender].level = level;
    // }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
    function transfer(address payable to, uint amount) external onlyAdmin {
        to.transfer(amount);
    }

   
    
}