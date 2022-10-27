// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error RandomIpfsNft__NotEnoughETHSent();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721 {
	/* Type Declarations */
	enum Breed {
		PUG,
		SHIBA_INU,
		ST_BERNARD
	}
	/* Chainlink VRF Variables */
	VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
	uint64 private immutable i_subscriptionId;
	bytes32 private immutable i_keyHash; //gasLane
	uint32 private immutable i_callbackGasLimit;
	uint16 private constant REQUEST_CONFIRMATIONS = 3;
	uint32 private constant NUM_WORDS = 1;

	/* NFT Variables */
	uint256 private s_tokenCounter;
	uint256 private i_mintFee;
	uint256 internal constant MAX_CHANCE_VALUE = 100;

	/* VRF Helpers */
	mapping (uint256 => address) public s_requestIdToAddress;

	/* Events */
	event NftMintRequested(uint256 indexed requestId, address minter);

	/* Functions*/
    constructor(address vrfCoordinatorV2,
		string memory _name, 
		string memory _symbol,
		bytes32 keyHash,
		uint64 subscriptionId,
		uint32 callbackGasLimit, 
		uint256 mintFee,
		) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721(_name, _symbol){
			i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
			i_keyHash = keyHash;
			i_subscriptionId = subscriptionId;
			i_callbackGasLimit = callbackGasLimit;
			i_mintFee = mintFee;
		}

	function requestNft() public payable returns (uint256 requestId) {
		if (msg.value < i_mintFee) {
			revert RandomIpfsNft__NotEnoughETHSent();
		}

		requestId = i_vrfCoordinator.requestRandomWords(i_keyHash,i_subscriptionId,REQUEST_CONFIRMATIONS,i_callbackGasLimit,NUM_WORDS);
		s_requestIdToAddress[requestId] = msg.sender;
		emit NftMintRequested(requestId, msg.sender);
	}
    function fulfillRandomWords(uint 256 requestId, uint256[] memory randomWords) internal override {
		address minter = s_requestIdToAddress[requestId];
		uint256 nftId = s_tokenCounter;
		s_tokenCounter++;
		_safeMint(minter,nftId);
		// ERC721 token, but what does it look like?
		uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
		// will return num between 1 - 99
    }

	function getBreedFromModdedRng(uint256 moddedRng) public pure return(Breed) {
		uint256 cumulativeSum = 0;
		uint256[3] memory chanceArray = getChanceArray();
		for(uint256 i = 0; i < chanceArray.length(); i++) {
			if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
				return Breed(i);
			}
			cumulativeSum += callbackGasLimit[i];
		}
	}

	function getChanceArray() public pure returns(uint256[3] memory) {
		return [5, 25, MAX_CHANCE_VALUE]; // index 1 has 20% and index 2 has 70%
	}
    function tokenUri(uint256) public view override returns(string memory) {}

	function getTokenCounter() returns(uint256) {
		return s_tokenCounter;
	}
}

