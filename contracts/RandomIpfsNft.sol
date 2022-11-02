// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__NotEnoughETHSent();
error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is
    VRFConsumerBaseV2,
    ERC721URIStorage,
    Ownable
{
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
    uint256 private s_tokenId;
    uint256 private i_mintFee;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;

    /* VRF Helpers */
    mapping(uint256 => address) public s_requestIdToAddress;

    /* Events */
    event NftMintRequested(
        uint256 indexed requestId,
        address minter
    );
    event NftMinted(Breed dogBreed, address minter);

    /* Functions*/
    constructor(
        address vrfCoordinatorV2,
        string memory _name,
        string memory _symbol,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 mintFee,
        string[3] memory dogTokenUris
    )
        VRFConsumerBaseV2(vrfCoordinatorV2)
        ERC721(_name, _symbol)
    {
        i_vrfCoordinator = VRFCoordinatorV2Interface(
            vrfCoordinatorV2
        );
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_mintFee = mintFee;
        s_dogTokenUris = dogTokenUris;
    }

    function requestNft()
        public
        payable
        returns (uint256 requestId)
    {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NotEnoughETHSent();
        }

        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToAddress[requestId] = msg.sender;
        emit NftMintRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address minter = s_requestIdToAddress[requestId];
        uint256 nftId = s_tokenId;
        s_tokenId++;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        // will return num between 1 - 99 because max chance is 100
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(minter, nftId);
        _setTokenURI(nftId, s_dogTokenUris[uint256(dogBreed)]);
        emit NftMinted(dogBreed, minter);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{
            value: amount
        }("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getBreedFromModdedRng(uint256 moddedRng)
        public
        pure
        returns (Breed)
    {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        // assume moddedRng = 25
        // i = 0
        // cumaltiveSum = 0
        // 25 is not less than 10 (chanceArray[i])
        // i = 1
        // cumaltiveSum = 10
        // 25 is greater than 10 AND 25 is less than 40
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRng >= cumulativeSum &&
                moddedRng < cumulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray()
        public
        pure
        returns (uint256[3] memory)
    {
        return [10, 30, MAX_CHANCE_VALUE]; // index 1 has 20% and index 2 has 60%
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenId;
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUris(uint256 index)
        public
        view
        returns (string memory)
    {
        return s_dogTokenUris[index];
    }
}
