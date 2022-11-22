// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "base64-sol/base64.sol";

error DynamicSvgNft__NotEnoughETHSent();
error DynamicSvgNft__TransferFailed();

contract DynamicSvgNft is ERC721, Ownable {
    /* Type Declarations */
    /* NFT Variables */
    uint256 private s_tokenId;
    uint256 private immutable i_mintFee;
    string private i_lowImageUri;
    string private i_highImageUri;
    string private constant base64EncodedSvgPrefix =
        "image/svg+xml;base64,";

    /* Events */
    event NftMinted(uint256 tokenId, address minter);

    /* Functions*/
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 mintFee,
        string memory lowSvg,
        string memory highSvg
    )
        // "Dynamic SVG NFT", "DSN"
        ERC721(_name, _symbol)
    {
        s_tokenId = 0; // NFT ID starts at 0
        i_mintFee = mintFee;
    }

    function svgToImageUri(string memory svg)
        public
        pure
        returns (string memory)
    {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(
                abi.encodePacked(
                    base64EncodedSvgPrefix,
                    svgBase64Encoded
                )
            );
    }

    function safeMint() public payable {
        if (msg.value < i_mintFee) {
            revert DynamicSvgNft__NotEnoughETHSent();
        }
        _safeMint(msg.sender, s_tokenId);
        emit NftMinted(s_tokenId, msg.sender);
        s_tokenId++;
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{
            value: amount
        }("");
        if (!success) {
            revert DynamicSvgNft__TransferFailed();
        }
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenId;
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }
}
