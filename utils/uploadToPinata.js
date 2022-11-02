const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
	const fullImagesPath = path.resolve(imagesFilePath)
	const files = fs.readdirSync(fullImagesPath)
	let responses = []
	console.log("Uploading to IPFS!")
	for (fileIndex in files) {
		console.log(`Working on ${fileIndex}...`)
		const readableFileStream = fs.createReadStream(
			`${fullImagesPath}/${files[fileIndex]}`
		)
		try {
			const reponse = await pinata.pinFileToIPFS(readableFileStream)
			responses.push(reponse)
		} catch (error) {
			console.log(error)
		}
	}
	return { responses, files }
}

module.exports = { storeImages }
