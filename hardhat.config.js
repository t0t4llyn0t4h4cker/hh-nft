require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL_DEV = process.env.GOERLI_RPC_URL_DEV
const GOERLI_RPC_URL_LM = process.env.GOERLI_RPC_URL_LM
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const LM_MAINNET_RPC_URL = process.env.LM_MAINNET_RPC_URL
const DEV_MAINNET_RPC_URL = process.env.DEV_MAINNET_RPC_URL

module.exports = {
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			chainId: 31337,
			// forking: {
			// 	// url: LM_MAINNET_RPC_URL, // KEY change
			// 	url: DEV_MAINNET_RPC_URL,
			// },
			// saveDeployments: true,
			// blockConfirmations: 5,
		},
		goerli: {
			chainId: 5,
			blockConfirmations: 5,
			url: GOERLI_RPC_URL_DEV,
			saveDeployments: true,
			accounts: [PRIVATE_KEY, PRIVATE_KEY2],
		},
	},
	solidity: {
		compilers: [{ version: "0.8.7" }, { version: "0.8.4" }, { version: "0.8.0" }],
	},
	namedAccounts: {
		deployer: {
			default: 0, // by default will take first account as deployer
			1: 0, // on mainnet will take first account as deployer
			5: 0,
		},
		user1: {
			default: 1,
			5: 1,
		},
		user2: {
			default: 2,
			5: 2,
		},
		user4: {
			default: 3,
			5: 3,
		},
	},
	etherscan: { apiKey: ETHERSCAN_API_KEY },
	gasReporter: {
		enabled: false,
		outputFile: "gas-report.txt",
		noColors: true,
		currency: "USD",
		// token: "Matic",
		// coinmarketcap: COINMARKETCAP_API_KEY,
	},
	mocha: {
		timeout: 500000, // 500 seconds max for running tests
	},
}
