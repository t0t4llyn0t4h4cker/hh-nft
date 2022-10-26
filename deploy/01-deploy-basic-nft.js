const { network } = require("hardhat")
const { developmentChains, TOKEN_NAME, TOKEN_SYMBOL } = require("../helper-hardhat-config.js")
const { verify } = require("../utils/verify.js")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()

	log("----------------------------------")
	const args = [TOKEN_NAME, TOKEN_SYMBOL]
	// deploy our contract
	const basicNftContract = await deploy("BasicNft", {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	})
	log(`NFT Contract deployed at ${basicNftContract.address}`)

	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(basicNftContract.address, args)
	}
	log("----------------------------------")
}

module.exports.tags = ["all", "deploy", "basicnft"]
