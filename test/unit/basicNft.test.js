const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { developmentChains, TOKEN_NAME, TOKEN_SYMBOL } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
	? describe.skip
	: describe("Basic NFT Unit Tests", async () => {
			// setup here
			const chainId = network.config.chainId
			let deployer, user1, user2, user3, basicNftContract
			beforeEach(async () => {
				const accounts = await getNamedAccounts()
				deployer = accounts.deployer
				user1 = accounts.user1
				user2 = accounts.user2
				user3 = accounts.user3
				await deployments.fixture(["all"])
				basicNftContract = await ethers.getContract("BasicNft", deployer)
			})
			it("deploys the contract", async () => {
				assert(basicNftContract.address)
			})

			describe("Constructor", async () => {
				it("initializes name and symbol correctly", async () => {
					const nameResult = await basicNftContract.name() // string
					const symbolResult = await basicNftContract.symbol() // string
					const tokenCounter = await basicNftContract.getTokenCounter()
					assert.equal(nameResult, TOKEN_NAME)
					assert.equal(symbolResult, TOKEN_SYMBOL)
					assert.equal(tokenCounter, 0)
				})
				it("initializes URI correctly", async () => {
					const uriResult = await basicNftContract.tokenURI(0) // string
					const TOKEN_URI =
						"ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
					assert.equal(uriResult, TOKEN_URI)
				})
			})

			describe("mintNft", async () => {
				it("the first nft will a tokenid of 1 and the counter will increment after mint by 1", async () => {
					const txMint = await basicNftContract.mintNft()
					const txMintResult = await txMint.wait(1)
					const tokenId = await txMintResult.events[0].args.tokenId

					const expectedTokenId = await basicNftContract.getTokenCounter()

					assert.equal(expectedTokenId.toString(), tokenId.toString())
				})
				it("shows correct balance and owner of the NFT", async () => {
					const txMint = await basicNftContract.mintNft()
					const txMintResult = await txMint.wait(1)
					const tokenId = txMintResult.events[0].args.tokenId

					const deployerBalance = await basicNftContract.balanceOf(deployer)
					const owner = await basicNftContract.ownerOf(tokenId)

					assert.equal(deployerBalance, 1)
					assert.equal(owner, deployer)
				})
			})
	  })
