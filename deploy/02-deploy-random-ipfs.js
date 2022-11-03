const { network, ethers } = require("hardhat")
const {
	developmentChains,
	networkConfig,
	TOKEN_NAME,
	TOKEN_SYMBOL,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify.js")
const {
	storeImages,
	storeTokenUriMetadata,
} = require("../utils/uploadToPinata.js")
require("dotenv").config()

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("10")
const imagesLocation = "./images/randomNft"
const metadataTemplate = {
	name: "",
	description: "",
	image: "",
	attributes: [
		{
			trait_type: "Cuteness",
			value: 100,
		},
	],
}

let tokenUris = [
	"ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
	"ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
	"ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
]

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()
	const chainId = network.config.chainId

	/// get the IPFS hashes of our images
	if (process.env.UPLOAD_TO_PINATA == "true") {
		tokenUris = await handleTokenUris()
	}

	// 1. local IPFS node https://docs.ipfs.io/
	// 2. pinate https://www.pinate.cloud/
	// 3. nft.storage https://nft.storage/

	let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

	if (developmentChains.includes(network.name)) {
		vrfCoordinatorV2Mock = await ethers.getContract(
			"VRFCoordinatorV2Mock"
		)
		vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
		const tx = await vrfCoordinatorV2Mock.createSubscription()
		const txReciept = await tx.wait(1)
		subscriptionId = txReciept.events[0].args.subId
		log("Subscription created successfully! :)")
		// now fund the sub
		await vrfCoordinatorV2Mock.fundSubscription(
			subscriptionId,
			VRF_SUB_FUND_AMOUNT
		)
		log("Successfully funded the subscription")
	} else {
		vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
		subscriptionId = networkConfig[chainId]["subscriptionId"]
	}
	log("-----------------------------")
	//
	//

	const keyHash = networkConfig[chainId]["keyHash"]
	const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]

	const mintFee = networkConfig[chainId]["mintFee"]
	// const dogTokenUris = networkConfig[chainId]["dogTokenUris"]

	const args = [
		vrfCoordinatorV2Address,
		TOKEN_NAME,
		TOKEN_SYMBOL,
		keyHash,
		subscriptionId,
		callbackGasLimit,
		mintFee,
		tokenUris,
	]
	// deploy our contract
	const randomIpfsContract = await deploy("RandomIpfsNft", {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	})
	if (developmentChains.includes(network.name)) {
		log("Local network detected, Consumer added to vrfCoordinatorV2Mock")
		await vrfCoordinatorV2Mock.addConsumer(
			subscriptionId,
			randomIpfsContract.address
		)
	}
	log(`RandomIpfsNft Contract deployed at ${randomIpfsContract.address}`)

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		log("Verifying...")
		await verify(randomIpfsContract.address, args)
	}
	log("----------------------------------")
}

async function handleTokenUris() {
	tokenUris = []
	// store image in IPFS
	// store metadta in IPFS
	const { responses: imageUploadResponses, files } = await storeImages(
		imagesLocation
	)
	for (let imageUploadResponseIndex in imageUploadResponses) {
		// create metadata
		// upload metadata
		let tokenUriMetadata = { ...metadataTemplate } // js sugar to unpack
		tokenUriMetadata.name = files[imageUploadResponseIndex].replace(
			".png",
			""
		) // strips the file ending from the locally read files
		tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
		tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}` // IpfsHash specifying the part of the response we want to store
		console.log(`Uploading ${tokenUriMetadata.name}'s Metadata`)
		// store the JSON to pinata / IPFS
		const metadataUploadResponse = await storeTokenUriMetadata(
			tokenUriMetadata
		)
		tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
	}
	console.log("Token URIs Uploaded! They are:")
	console.log(tokenUris)
	return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
