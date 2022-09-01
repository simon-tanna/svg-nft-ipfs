// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error SvgNFT__RangeOutOfBounds();
error SvgNft__NeedMoreETH();
error SvgNft__TransferFailed();

contract SvgNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // Type declaration for types of monster
    enum Monster {
        LOVE,
        HATE,
        HAPPY,
        SAD,
        INDIFFERENT
    }

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF helpers
    // this mapping is invoked in the requestNFT and fulfillRandomWords functions to assign the requestId to msg.sender
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT Variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_monsterTokenUris;
    uint256 internal immutable i_mintFee;

    //Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Monster monsterType, address minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory monsterTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random Monster NFT", "RMN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_monsterTokenUris = monsterTokenUris;
        i_mintFee = mintFee;
    }

    // this function requests a random number for our NFT
    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert SvgNft__NeedMoreETH();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        // emit an event
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        // this ensures that the owner of the NFT the address who made the request in reqestNFT
        address monsterOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        // set the type of monster using mod.
        uint256 moddedRng = randomWords[0] % 100;
        // this returns a number 0 - 99
        Monster monsterType = getMonsterFromModdedRng(moddedRng);
        _safeMint(monsterOwner, newTokenId);
        // _setTokenURI is a function pulled from ERC721URIStorage
        // it sets the TokenURI
        _setTokenURI(newTokenId, s_monsterTokenUris[uint256(monsterType)]);
        emit NftMinted(monsterType, monsterOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert SvgNft__TransferFailed();
        }
    }

    function getMonsterFromModdedRng(uint256 moddedRng)
        public
        pure
        returns (Monster)
    {
        uint256 sum = 0;
        uint256[5] memory chanceArray = getChanceOfMonster();
        // loop to get type of monster from chance array
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= sum && moddedRng < sum + chanceArray[i]) {
                return Monster(i);
            }
            sum += chanceArray[i];
        }
        revert SvgNFT__RangeOutOfBounds();
    }

    // this function will determine the chance of getting a particular monster
    // it returns a uint256 of size 3 in memory
    function getChanceOfMonster() public pure returns (uint256[5] memory) {
        return [20, 40, 60, 80, MAX_CHANCE_VALUE];
    }

    // function tokenURI(uint256) public view override returns (string memory) {
    //     // making change here
    // }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getMonsterTokenUris(uint256 index)
        public
        view
        returns (string memory)
    {
        return s_monsterTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
