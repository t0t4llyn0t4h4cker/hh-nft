const { ethers } = require("hardhat")

const networkConfig = {
	5: {
		name: "goerli",
		vrfCoordinatorV2:
			"0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
		entranceFee: ethers.utils.parseEther("0.01"),
		mintFee: ethers.utils.parseEther("0.05"),
		dogTokenUris: ["uri1", "uri2", "uri3"],
		keyHash:
			"0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", //30 gwei
		subscriptionId: "4981", // independent to the wallet setting up vrf.chain.link
		callbackGasLimit: "500000", // 500,000
		updateInterval: "30", // seconds
	},
	31337: {
		name: "hardhat",
		entranceFee: ethers.utils.parseEther("0.01"),
		mintFee: ethers.utils.parseEther("0.05"),
		dogTokenUris: ["uri1", "uri2", "uri3"],
		keyHash:
			"0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
		callbackGasLimit: "500000",
		updateInterval: "30",
		subscriptionId: "1",
	},
}

const INITIAL_SUPPLY = "1000000000000000000000000"
const TOKEN_NAME = "NEWNEW"
const TOKEN_SYMBOL = "NEW"
const developmentChains = ["hardhat", "localhost"]

module.exports = {
	networkConfig,
	developmentChains,
	INITIAL_SUPPLY,
	TOKEN_NAME,
	TOKEN_SYMBOL,
}
