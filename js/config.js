const deepseek_api ='sk-6074908ce7954bd89d494d57651392a8';
// Expose config variables globally for reports and other scripts
window.deepseek_api = deepseek_api;


// تنظیمات قرارداد LevelUp

const CPA_ADDRESS = '0x0f5Da8FB0b32b223fFda6b7905cD1393924bdF0F';
window.CPA_ADDRESS = CPA_ADDRESS;

// آدرس DAI (Polygon)
const DAI_ADDRESS = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'; // Polygon DAI

// استفاده از DAI
window.DAI_ADDRESS = DAI_ADDRESS;
const DAI_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountCPA",
				"type": "uint256"
			}
		],
		"name": "Activated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPoints",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newCap",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BinaryPointsUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPoolSize",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "addedAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BinaryPoolUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "claimer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalDistributed",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "claimerReward",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BinaryRewardDistributed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "daiAmount",
				"type": "uint256"
			}
		],
		"name": "buyTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimMonthlyReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "IndexTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amountCPA",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			}
		],
		"name": "purchase",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountCPA",
				"type": "uint256"
			}
		],
		"name": "PurchaseKind",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "newUser",
				"type": "address"
			}
		],
		"name": "registerAndActivate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			}
		],
		"name": "sellTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "daiAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			}
		],
		"name": "TokensBought",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "daiAmount",
				"type": "uint256"
			}
		],
		"name": "TokensSold",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferIndexOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "parent",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "position",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "TreeStructureUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "cashback",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "cashBack",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractTotalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "deployer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "daiAmount",
				"type": "uint256"
			}
		],
		"name": "estimateBuy",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			}
		],
		"name": "estimateSell",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractTokenBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractDAIBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getLeftAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getLeftChild",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getParent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPointValue",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getReferrer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getRegPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getRightAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getRightChild",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTokenPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserTree",
		"outputs": [
			{
				"internalType": "address",
				"name": "left",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "right",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "activated",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "binaryPoints",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "binaryPointCap",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "depositedAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastMonthlyClaim",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalMonthlyRewarded",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "refclimed",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "indexToAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_BINARY_POINT_CAP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REFERRAL_FEE_PERCENT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalClaimableBinaryPoints",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalClaimablePoints",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "daiToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "users",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "binaryPoints",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "binaryPointCap",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "binaryPointsClaimed",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "activated",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "totalPurchasedKind",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "upgradeTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastClaimTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "leftPoints",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rightPoints",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastMonthlyClaim",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalMonthlyRewarded",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "refclimed",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "depositedAmount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "wallets",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const CPA_ABI =[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amountCPA",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			}
		],
		"name": "purchase",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountCPA",
				"type": "uint256"
			}
		],
		"name": "Activated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPoints",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newCap",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BinaryPointsUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPoolSize",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "addedAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BinaryPoolUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "claimer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalDistributed",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "claimerReward",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BinaryRewardDistributed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "daiAmount",
				"type": "uint256"
			}
		],
		"name": "buyTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "minReward",
				"type": "uint256"
			}
		],
		"name": "claimMonthlyReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "IndexTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "monthsPassed",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "MonthlyRewardClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "MonthlyRewardFailed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountCPA",
				"type": "uint256"
			}
		],
		"name": "PurchaseKind",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "newUser",
				"type": "address"
			}
		],
		"name": "registerAndActivate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "newUser",
				"type": "address"
			}
		],
		"name": "registerFree",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			}
		],
		"name": "sellTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "daiAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			}
		],
		"name": "TokensBought",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "daiAmount",
				"type": "uint256"
			}
		],
		"name": "TokensSold",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferIndexOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "parent",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "position",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "TreeStructureUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "cashback",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "cashBack",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractTotalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "daiToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "deployer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "daiAmount",
				"type": "uint256"
			}
		],
		"name": "estimateBuy",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			}
		],
		"name": "estimateSell",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractdaiBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractTokenBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getLeftAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getLeftChild",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getParent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPointValue",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getReferrer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getRegPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getRightAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getRightChild",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTokenPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserTree",
		"outputs": [
			{
				"internalType": "address",
				"name": "left",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "right",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "activated",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "binaryPoints",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "binaryPointCap",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "depositedAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastMonthlyClaim",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalMonthlyRewarded",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "refclimed",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "indexToAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_BINARY_POINT_CAP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REFERRAL_FEE_PERCENT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalClaimableBinaryPoints",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalClaimablePoints",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "users",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "binaryPoints",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "binaryPointCap",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "binaryPointsClaimed",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "activated",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "totalPurchasedKind",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "upgradeTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastClaimTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "leftPoints",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rightPoints",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastMonthlyClaim",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalMonthlyRewarded",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "refclimed",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "depositedAmount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "wallets",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
window.CPA_ABI = CPA_ABI;

// مدیریت درخواست‌های همزمان
let isInitializing = false;
let initializationPromise = null;
let permissionRequestInProgress = false;
let connectionCache = null;
let lastConnectionAttempt = 0;
const CONNECTION_COOLDOWN = 5000; // 5 seconds cooldown between connection attempts

// Add global connection state management
let globalConnectionPromise = null;
let connectionState = {
	isConnecting: false,
	lastConnectionTime: 0,
	connectionTimeout: null
};

// Add request deduplication for eth_requestAccountsاصل
let pendingAccountRequest = null;

async function requestAccountsWithDeduplication() {
	// If there's already a pending request, wait for it
	if (pendingAccountRequest) {
		return await pendingAccountRequest;
	}
	
	// Create new request
	pendingAccountRequest = window.ethereum.request({ method: 'eth_requestAccounts' });
	
	try {
		const result = await pendingAccountRequest;
		return result;
	} finally {
		// Clear the pending request
		pendingAccountRequest = null;
	}
}

async function performWeb3Initialization() {
	try {
		const provider = new ethers.BrowserProvider(window.ethereum);
		let signer;
		const accounts = await window.ethereum.request({ method: 'eth_accounts' });
		if (accounts && accounts.length > 0) {
			signer = await provider.getSigner();
		} else {
			try {
				await requestAccountsWithDeduplication();
				signer = await provider.getSigner();
			} catch (permissionError) {
				if (permissionError.code === -32002) {
					await new Promise(resolve => {
						const checkInterval = setInterval(async () => {
							try {
								const accounts = await window.ethereum.request({ method: 'eth_accounts' });
								if (accounts && accounts.length > 0) {
									clearInterval(checkInterval);
									resolve();
								}
							} catch (error) {}
						}, 2000);
						setTimeout(() => {
							clearInterval(checkInterval);
							resolve();
						}, 15000);
					});
					const retryAccounts = await window.ethereum.request({ method: 'eth_accounts' });
					if (retryAccounts && retryAccounts.length > 0) {
						signer = await provider.getSigner();
					} else {
						throw new Error('User did not approve connection');
					}
				} else {
					throw permissionError;
				}
			}
		}

		// این بخش را اضافه کنید:
		const contract = new ethers.Contract(CPA_ADDRESS, CPA_ABI, signer);
		const address = await signer.getAddress();
		const network = await provider.getNetwork();

		const connectionData = {
			provider: provider,
			signer: signer,
			contract: contract,
			address: address,
			initializeWeb3: initializeWeb3
		};

		window.contractConfig = {
			...window.contractConfig,
			...connectionData
		};

		// Cache the connection
		connectionCache = connectionData;

		return window.contractConfig;

	} catch (error) {
		console.error('خطا در راه‌اندازی Web3:', error);

		if (window.contractConfig) {
			window.contractConfig.provider = null;
			window.contractConfig.signer = null;
			window.contractConfig.contract = null;
			window.contractConfig.address = null;
		}

		// Clear cache on error
		connectionCache = null;

		throw error;
	}
}

async function initializeWeb3() {
	// If there's already a global connection in progress, wait for it
	if (globalConnectionPromise) {
		return await globalConnectionPromise;
	}
	
	// Check if we have a valid cached connection
	if (connectionCache && 
		connectionCache.provider && 
		connectionCache.signer && 
		connectionCache.contract &&
		connectionCache.address) {
		return connectionCache;
	}
	
	if (window.contractConfig && 
		window.contractConfig.provider && 
		window.contractConfig.signer && 
		window.contractConfig.contract &&
		window.contractConfig.address) {
		return window.contractConfig;
	}
	
	// Check cooldown to prevent rapid connection attempts
	const now = Date.now();
	if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
		throw new Error('Connection attempt too soon. Please wait a moment.');
	}
	lastConnectionAttempt = now;
	
	// Set global connection state
	connectionState.isConnecting = true;
	connectionState.lastConnectionTime = now;
	
	// Create global connection promise
	globalConnectionPromise = performWeb3Initialization();
	
	try {
		const result = await globalConnectionPromise;
		window.initializeWeb3 = initializeWeb3;
		return result;
	} finally {
		// Clear global connection state
		globalConnectionPromise = null;
		connectionState.isConnecting = false;
	}
}

// تنظیمات قرارداد
window.contractConfig = {
	CPA_ADDRESS: CPA_ADDRESS,
	CPA_ABI: CPA_ABI,
	provider: null,
	signer: null,
	contract: null,
	address: null,
	initializeWeb3: initializeWeb3
};


const debounceTimers = new Map();

function debounce(key, func, delay = 1000) {
	if (debounceTimers.has(key)) {
		clearTimeout(debounceTimers.get(key));
	}
	
	return new Promise((resolve, reject) => {
		const timer = setTimeout(async () => {
			try {
				const result = await func();
				resolve(result);
			} catch (error) {
				reject(error);
			} finally {
				debounceTimers.delete(key);
			}
		}, delay);
		
		debounceTimers.set(key, timer);
	});
}

// RPC retry mechanism for handling "missing revert data" errors
window.retryRpcOperation = async function(operation, maxRetries = 3, delay = 1000) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await operation();
		} catch (error) {
			console.warn(`RPC operation failed (attempt ${i + 1}/${maxRetries}):`, error);
			
			// Check if it's a retryable error
			if (error.message && (
				error.message.includes('missing revert data') ||
				error.message.includes('Network Error') ||
				error.message.includes('could not coalesce error') ||
				error.code === -32000 ||
				error.code === -32603
			)) {
				if (i < maxRetries - 1) {
					console.log(`Retrying in ${delay}ms...`);
					await new Promise(resolve => setTimeout(resolve, delay));
					delay *= 1.5; // Exponential backoff
					continue;
				}
			}
			
			// If not retryable or max retries reached, throw the error
			throw error;
		}
	}
};

// تابع مرکزی اتصال کیف پول
window.connectWallet = async function() {
	return await debounce('connectWallet', async () => {
		const maxRetries = 2;
		let lastError;
		
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				// بررسی اتصال موجود
				if (connectionCache && 
					connectionCache.contract && 
					connectionCache.address && 
					connectionCache.signer) {
					return {
						contract: connectionCache.contract,
						address: connectionCache.address,
						signer: connectionCache.signer,
						provider: connectionCache.provider
					};
				}
				
				if (window.contractConfig && 
					window.contractConfig.contract && 
					window.contractConfig.address && 
					window.contractConfig.signer) {
					return {
						contract: window.contractConfig.contract,
						address: window.contractConfig.address,
						signer: window.contractConfig.signer,
						provider: window.contractConfig.provider
					};
				}
				
				// Check if there's already a connection in progress
				if (connectionState.isConnecting && globalConnectionPromise) {
					console.log('Connection already in progress, waiting...');
					const result = await globalConnectionPromise;
					if (result && result.contract && result.address) {
						return {
							contract: result.contract,
							address: result.address,
							signer: result.signer,
							provider: result.provider
						};
					}
				}
				
				// راه‌اندازی Web3
				const result = await window.contractConfig.initializeWeb3();
				if (result && result.contract && result.address) {
					// رفرش شبکه بعد از اتصال موفق
					setTimeout(async () => {
						try {
							await window.refreshNetworkAfterConnection(result);
						} catch (error) {
							console.warn('Error refreshing network data after connection:', error);
						}
					}, 1000); // 1 ثانیه صبر کن
					
					return {
						contract: result.contract,
						address: result.address,
						signer: result.signer,
						provider: result.provider
					};
				}
				
				throw new Error('خطا در اتصال به کیف پول');
			} catch (error) {
				lastError = error;
				console.error(`Central: Error connecting wallet (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
				
				// Don't clear cache on -32002 error (already processing)
				if (error.code === -32002) {
					console.log('MetaMask is already processing request, waiting...');
					// Wait a bit and try again
					await new Promise(resolve => setTimeout(resolve, 2000));
					continue;
				}
				
				// Clear cache on other errors to allow retry
				connectionCache = null;
				if (window.contractConfig) {
					window.contractConfig.provider = null;
					window.contractConfig.signer = null;
					window.contractConfig.contract = null;
					window.contractConfig.address = null;
				}
				
				// کاهش delay retry برای سرعت بیشتر
				if (attempt < maxRetries) {
					await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1))); // Faster retry
				}
			}
		}
		
		throw lastError;
	});
};

// تابع رفرش شبکه بعد از اتصال کیف پول
window.refreshNetworkAfterConnection = async function(connection) {
	try {
		// رفرش آمار شبکه
		if (typeof window.loadNetworkStats === 'function' && connection && connection.contract) {
			await window.loadNetworkStats(connection.contract);
		}
		
		// رفرش درخت شبکه
		if (typeof window.renderSimpleBinaryTree === 'function') {
			await window.renderSimpleBinaryTree();
		} else if (typeof window.renderNetworkTree === 'function') {
			await window.renderNetworkTree();
		}
		
		// رفرش پروفایل کاربر
		if (typeof window.loadUserProfile === 'function') {
			await window.loadUserProfile();
		}
		
		// رفرش موجودی‌های ترنسفر
		if (typeof window.updateTransferBalancesOnConnect === 'function') {
			await window.updateTransferBalancesOnConnect();
		}
		
		// رفرش داده‌های سواپ
		if (window.swapManager && typeof window.swapManager.refreshSwapData === 'function') {
			await window.swapManager.refreshSwapData();
		}
		
	} catch (error) {
		console.warn('Error refreshing network data:', error);
	}
};

// تابع نمایش پیام موفقیت
window.showSuccessMessage = function(message) {
	try {
		// ایجاد عنصر پیام
		const messageElement = document.createElement('div');
		messageElement.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: linear-gradient(135deg, #00ff88, #00cc66);
			color: #181c2a;
			padding: 15px 20px;
			border-radius: 10px;
			font-weight: bold;
			z-index: 10000;
			box-shadow: 0 4px 12px rgba(0,255,136,0.3);
			border: 1px solid rgba(0,255,136,0.5);
			max-width: 300px;
			word-wrap: break-word;
			animation: slideInRight 0.5s ease;
		`;
		messageElement.textContent = message;
		messageElement.id = 'success-message';
		
		// اضافه کردن CSS animation
		const style = document.createElement('style');
		style.textContent = `
			@keyframes slideInRight {
				from { transform: translateX(100%); opacity: 0; }
				to { transform: translateX(0); opacity: 1; }
			}
			@keyframes slideOutRight {
				from { transform: translateX(0); opacity: 1; }
				to { transform: translateX(100%); opacity: 0; }
			}
		`;
		document.head.appendChild(style);
		
		// حذف پیام قبلی اگر وجود دارد
		const existingMessage = document.getElementById('success-message');
		if (existingMessage) {
			existingMessage.remove();
		}
		
		document.body.appendChild(messageElement);
		
		// حذف خودکار بعد از 5 ثانیه
		setTimeout(() => {
			if (messageElement.parentNode) {
				messageElement.style.animation = 'slideOutRight 0.5s ease';
				setTimeout(() => {
					if (messageElement.parentNode) {
						messageElement.remove();
					}
				}, 500);
			}
		}, 5000);
		
	} catch (error) {
		console.warn('Error showing success message:', error);
	}
};

// تابع نمایش پیام خطا
window.showErrorMessage = function(message) {
	try {
		// ایجاد عنصر پیام
		const messageElement = document.createElement('div');
		messageElement.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: linear-gradient(135deg, #ff4444, #cc0000);
			color: #ffffff;
			padding: 15px 20px;
			border-radius: 10px;
			font-weight: bold;
			z-index: 10000;
			box-shadow: 0 4px 12px rgba(255,68,68,0.3);
			border: 1px solid rgba(255,68,68,0.5);
			max-width: 300px;
			word-wrap: break-word;
			animation: slideInRight 0.5s ease;
		`;
		messageElement.textContent = message;
		messageElement.id = 'error-message';
		
		// حذف پیام قبلی اگر وجود دارد
		const existingMessage = document.getElementById('error-message');
		if (existingMessage) {
			existingMessage.remove();
		}
		
		document.body.appendChild(messageElement);
		
		// حذف خودکار بعد از 5 ثانیه
		setTimeout(() => {
			if (messageElement.parentNode) {
				messageElement.style.animation = 'slideOutRight 0.5s ease';
				setTimeout(() => {
					if (messageElement.parentNode) {
						messageElement.remove();
					}
				}, 500);
			}
		}, 5000);
		
	} catch (error) {
		console.warn('Error showing error message:', error);
	}
};

// تابع رفرش شبکه بعد از تایید متامسک
window.refreshNetworkAfterMetaMaskApproval = async function() {
	try {
		// نمایش پیام موفقیت
		// if (typeof window.showSuccessMessage === 'function') {
		//     window.showSuccessMessage('کیف پول با موفقیت متصل شد و شبکه رفرش شد');
		// }
		
		// کمی صبر کن تا اتصال برقرار شود
		setTimeout(async () => {
			try {
				const connection = await window.connectWallet();
				if (connection) {
					await window.refreshNetworkAfterConnection(connection);
					
					// رفرش مخصوص درخت باینری
					if (typeof window.refreshBinaryTreeAfterMetaMask === 'function') {
						await window.refreshBinaryTreeAfterMetaMask();
					}
					
					// نمایش پیام موفقیت نهایی
					// if (typeof window.showSuccessMessage === 'function') {
					//     window.showSuccessMessage('شبکه و درخت باینری با موفقیت به‌روزرسانی شد');
					// }
				}
			} catch (error) {
				console.warn('Error refreshing network after MetaMask approval:', error);
				
				// نمایش پیام خطا
				if (typeof window.showErrorMessage === 'function') {
					window.showErrorMessage('خطا در به‌روزرسانی شبکه');
				}
			}
		}, 3000);
		
	} catch (error) {
		console.warn('Error in refreshNetworkAfterMetaMaskApproval:', error);
	}
};

// تابع پاک کردن کش اتصال
window.clearConnectionCache = function() {
	connectionCache = null;
	if (window.contractConfig) {
		window.contractConfig.provider = null;
		window.contractConfig.signer = null;
		window.contractConfig.contract = null;
		window.contractConfig.address = null;
	}
	isInitializing = false;
	initializationPromise = null;
	permissionRequestInProgress = false;
	lastConnectionAttempt = 0;
	
	// Clear global connection state
	globalConnectionPromise = null;
	connectionState.isConnecting = false;
	connectionState.lastConnectionTime = 0;
	if (connectionState.connectionTimeout) {
		clearTimeout(connectionState.connectionTimeout);
		connectionState.connectionTimeout = null;
	}
	
	// Clear pending account request
	pendingAccountRequest = null;
	
	// Clear function call cache
	functionCallCache.clear();
	
	// Clear debounce timers
	debounceTimers.forEach(timer => clearTimeout(timer));
	debounceTimers.clear();
};



// تنظیم event listeners برای MetaMask
if (typeof window.ethereum !== 'undefined') {
	// پاک کردن کش هنگام تغییر حساب
	window.ethereum.on('accountsChanged', async function (accounts) {
		console.log('MetaMask accounts changed:', accounts);
		window.clearConnectionCache();
		
		// بررسی وضعیت کاربر جدید و نمایش فرم ثبت‌نام اگر فعال نیست
		if (accounts && accounts.length > 0) {
			try {
				// کمی صبر کن تا اتصال جدید برقرار شود
				setTimeout(async () => {
					try {
						if (window.contractConfig && window.contractConfig.contract) {
							const { contract } = window.contractConfig;
							const userData = await contract.users(accounts[0]);
							if (!userData.activated) {
								// کاربر فعال نیست - فرم ثبت‌نام را نمایش بده
								if (typeof window.showRegistrationFormForInactiveUser === 'function') {
									window.showRegistrationFormForInactiveUser();
								}
							}
						}
						
						// رفرش شبکه بعد از تغییر حساب کاربر
						const connection = await window.connectWallet();
						if (connection) {
							await window.refreshNetworkAfterConnection(connection);
						}
						
						// فراخوانی تابع رفرش بعد از تایید متامسک
						setTimeout(() => {
							window.refreshNetworkAfterMetaMaskApproval();
						}, 1000); // 1 ثانیه صبر کن
						
					} catch (error) {
						console.log('Could not check user status after account change:', error);
					}
				}, 2000); // 2 ثانیه صبر کن
			} catch (error) {
				console.log('Error handling account change:', error);
			}
		}
	});
	
	// پاک کردن کش هنگام تغییر شبکه
	window.ethereum.on('chainChanged', async function (chainId) {
		console.log('MetaMask chain changed:', chainId);
		window.clearConnectionCache();
		
		// رفرش شبکه بعد از تغییر شبکه
		if (chainId === '0x89') { // Polygon network
			try {
				// کمی صبر کن تا اتصال جدید برقرار شود
				setTimeout(async () => {
					try {
						const connection = await window.connectWallet();
						if (connection) {
							await window.refreshNetworkAfterConnection(connection);
						}
					} catch (error) {
						console.warn('Error refreshing network data after chain change:', error);
					}
				}, 2000); // 2 ثانیه صبر کن
				
			} catch (error) {
				console.warn('Error handling chain change:', error);
			}
		}
	});
	
	// پاک کردن کش هنگام قطع اتصال
	window.ethereum.on('disconnect', function (error) {
		console.log('MetaMask disconnected:', error);
		window.clearConnectionCache();
	});
	
	// رفرش شبکه هنگام اتصال مجدد
	window.ethereum.on('connect', async function (connectInfo) {
		console.log('MetaMask connected:', connectInfo);
		
		// کمی صبر کن تا اتصال جدید برقرار شود
		setTimeout(async () => {
			try {
				const connection = await window.connectWallet();
				if (connection) {
					await window.refreshNetworkAfterConnection(connection);
				}
			} catch (error) {
				console.warn('Error refreshing network data after reconnection:', error);
			}
		}, 2000); // 2 ثانیه صبر کن
	});
	

}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
	const error = event.reason;
	
	// Handle RPC errors gracefully
	if (error && (error.message || error.code)) {
		const errorType = window.handleRpcError(error, 'unhandled');
		
		if (errorType === null) {
			// Error was handled and should be ignored
			event.preventDefault();
			return;
		}
		
		if (errorType === 'retry' || errorType === 'wait') {
			// Error was handled and will be retried
			event.preventDefault();
			return;
		}
	}
	
	// Log other unhandled errors
	console.warn('Unhandled promise rejection:', event.reason);
});

// تابع جلوگیری از فراخوانی همزمان توابع
const functionCallCache = new Map();

async function preventConcurrentCalls(functionName, operation, cacheTime = 10000) {
	const cacheKey = `${functionName}_${Date.now()}`;
	
	// Check if there's already a pending call for this function
	if (functionCallCache.has(functionName)) {
		const cached = functionCallCache.get(functionName);
		if (Date.now() - cached.timestamp < cacheTime) {
			console.log(`Waiting for existing ${functionName} call to complete...`);
			return await cached.promise;
		}
	}
	
	// Create new promise for this function call
	const promise = operation();
	
	// Cache the promise
	functionCallCache.set(functionName, {
		promise: promise,
		timestamp: Date.now()
	});
	
	try {
		const result = await promise;
		return result;
	} finally {
		// Remove from cache after completion
		functionCallCache.delete(functionName);
	}
}

// تابع پاک کردن interval درخت شبکه
window.clearNetworkTreeInterval = function() {
	if (window.networkTreeInterval) {
		clearInterval(window.networkTreeInterval);
		window.networkTreeInterval = null;
		console.log('Network tree interval cleared');
	}
};

// تابع پاک کردن cache پروفایل کاربر
window.clearUserProfileCache = function(address = null) {
	try {
		if (address) {
			sessionStorage.removeItem(`userProfile_${address}`);
		} else {
			// پاک کردن همه cache های پروفایل
			const keys = Object.keys(sessionStorage);
			keys.forEach(key => {
				if (key.startsWith('userProfile_')) {
					sessionStorage.removeItem(key);
				}
			});
		}
		console.log('User profile cache cleared');
	} catch (e) {
		console.warn('Could not clear user profile cache:', e);
	}
};

// تابع بارگذاری خودکار آمار شبکه
window.autoLoadNetworkStats = async function() {
	try {
		// بررسی اینکه آیا صفحه فعال است
		if (document.hidden) {
			return;
		}
		
		const connection = await window.connectWallet();
		if (!connection || !connection.contract) {
			return;
		}
		
		// بارگذاری آمار شبکه
		await loadNetworkStats(connection.contract);
		
		// تنظیم interval برای بارگذاری مجدد غیرفعال شد - فقط رفرش دستی
		// if (!window.networkStatsInterval) {
		// 	window.networkStatsInterval = setInterval(async () => {
		// 		if (!document.hidden) {
		// 			try {
		// 				const conn = await window.connectWallet();
		// 				if (conn && conn.contract) {
		// 					await loadNetworkStats(conn.contract);
		// 				}
		// 			} catch (error) {
		// 				console.warn('Auto-load network stats error:', error);
		// 			}
		// 		}
		// 	}, 5 * 60 * 1000); // 5 دقیقه
		// }
	} catch (error) {
		console.warn('Auto-load network stats failed:', error);
	}
};

// تابع پاکسازی intervals
window.cleanupNetworkIntervals = function() {
	if (window.networkStatsInterval) {
		clearInterval(window.networkStatsInterval);
		window.networkStatsInterval = null;
	}
};

// تابع مرکزی دریافت پروفایل کاربر
window.getUserProfile = async function() {
	let address = null;
	return await preventConcurrentCalls('getUserProfile', async () => {
		try {
			const connection = await window.connectWallet();
			if (!connection || !connection.contract || !connection.address) {
				throw new Error('No wallet connection available');
			}
			const { contract, address: addr, provider, signer } = connection;
			address = addr;
			
			// بررسی cache برای جلوگیری از فراخوانی مکرر
			const cacheKey = `userProfile_${address}`;
			const cached = sessionStorage.getItem(cacheKey);
			if (cached) {
				const parsed = JSON.parse(cached);
				const cacheTime = parsed.timestamp || 0;
				// اگر کمتر از 30 ثانیه از آخرین درخواست گذشته، از cache استفاده کن
				if (Date.now() - cacheTime < 30000) {
					console.log('Using cached user profile');
					return parsed.data;
				}
			}
			
			// دریافت اطلاعات کاربر با مدیریت خطا
			let user;
			try {
				user = await window.retryRpcOperation(() => contract.users(address), 2);
			} catch (error) {
				console.error('Profile: Error fetching user data:', error);
				
				// Return default user data instead of throwing error
				user = {
					activated: false,
					index: 0n,
					referrer: '0x0000000000000000000000000000000000000000',
					activationTime: 0n,
					lastClaimTime: 0n,
					lastClaimLevel: 0n,
					lastCashbackClaim: 0n,
					totalCommission: 0n,
					leftChild: '0x0000000000000000000000000000000000000000',
					rightChild: '0x0000000000000000000000000000000000000000',
					level: 0n
				};
				console.warn('Using default user data due to contract error');
			}
			
			// دریافت موجودی‌ها با مدیریت خطا
			const balanceProvider = provider || signer.provider;
			if (!balanceProvider) {
				throw new Error('No provider available for balance check');
			}
			
			let polBalance = 0n;
			let lvlBalance = 0n;
			try {
				[polBalance, lvlBalance] = await Promise.all([
					window.retryRpcOperation(() => balanceProvider.getBalance(address), 2),
					window.retryRpcOperation(() => contract.balanceOf(address), 2)
				]);
			} catch (error) {
				console.error('Profile: Error fetching balances:', error);
				// Set default balances instead of throwing error
				polBalance = 0n;
				lvlBalance = 0n;
				console.warn('Using default balance values due to RPC error');
			}
			
			// دریافت قیمت‌ها برای محاسبه ارزش دلاری
			let lvlPriceMatic = 0n;
			let polPriceUSD = 0;
			try {
				lvlPriceMatic = await window.retryRpcOperation(() => contract.getTokenPrice(), 2);
			} catch (error) {
				console.error('Profile: Error fetching prices:', error);
				// Set default price instead of throwing error
				lvlPriceMatic = 0n;
				console.warn('Using default price values due to RPC error');
			}
			
			// محاسبه ارزش دلاری
			let lvlValueUSD = 0;
			if (lvlBalance && lvlPriceMatic && lvlBalance > 0n && lvlPriceMatic > 0n) {
				const lvlPriceFormatted = ethers.formatUnits(lvlPriceMatic, 18);
				lvlValueUSD = parseFloat(ethers.formatUnits(lvlBalance, 18)) * parseFloat(lvlPriceFormatted);
			}
			
			// محاسبه ارزش دلاری کل POL (POL همیشه 1 دلار است)
			let polValueUSD = 0;
			if (polBalance && polBalance > 0n) {
				polValueUSD = parseFloat(ethers.formatEther(polBalance));
			}
			
			// دریافت موجودی DAI
			let daiBalance = '0';
			try {
					  const daiContract = new ethers.Contract(DAI_ADDRESS, DAI_ABI, provider);
	  const daiRaw = await daiContract.balanceOf(address);
      daiBalance = (Number(daiRaw) / 1e18).toFixed(2); // DAI has 18 decimals
			} catch (e) {
				daiBalance = '0';
			}
			
			// فرمت‌دهی خروجی و جلوگیری از undefined
			const safeFormat = (val, decimals = 8) => {
				try {
					if (typeof val === 'bigint') {
						if (val === 0n) return '0';
						return ethers.formatUnits(val, decimals);
					}
					if (typeof val === 'number') return val.toFixed(4);
					if (typeof val === 'string') return val;
					return '0';
				} catch (e) { 
					console.error('Profile: Error formatting value:', e);
					return '0'; 
				}
			};
			
			// === محاسبه referrer بر اساس index ===
			let referrer = null;
			try {
				const userIndex = user.index ? BigInt(user.index) : 0n;
				const referrerIndex = userIndex / 2n;
				// فقط اگر ایندکس معرف بزرگتر از صفر بود، referrer را بگیر
				if (referrerIndex > 0n) {
					referrer = await contract.getReferrer(referrerIndex);
				} else {
					referrer = address; // اگر ایندکس صفر بود، خودش معرف خودش است
				}
			} catch (e) {
				console.error('Profile: Error fetching referrer:', e);
				referrer = null;
			}
			// === پایان محاسبه referrer ===
			
			// بارگذاری آمار شبکه (در پس‌زمینه)
			window.autoLoadNetworkStats().catch(error => {
				console.warn('Failed to load network stats:', error);
			});
			
			// مدیریت دکمه ثبت‌نام اصلی
			if (typeof window.manageMainRegistrationButton === 'function') {
				window.manageMainRegistrationButton();
			}
			
			// به‌روزرسانی نمایش ID کاربر
			if (user.index) {
				if (typeof window.updateCPAIdDisplay === 'function') {
					window.updateCPAIdDisplay(user.index);
				}
			}
			
			const profile = {
				address: address,
				referrer: referrer,
				activated: user.activated || false,
				binaryPoints: user.binaryPoints ? user.binaryPoints.toString() : '0',
				binaryPointCap: user.binaryPointCap ? user.binaryPointCap.toString() : '0',
				binaryPointsClaimed: user.binaryPointsClaimed ? user.binaryPointsClaimed.toString() : '0',
				totalPurchasedMATIC: ethers.formatEther(user.totalPurchasedMATIC || 0n),
				totalPurchasedKind: user.totalPurchasedKind ? user.totalPurchasedKind.toString() : '0',
				polBalance: ethers.formatEther(polBalance || 0n),
				maticBalance: ethers.formatEther(polBalance || 0n),
				lvlBalance: ethers.formatUnits(lvlBalance || 0n, 18),
				polValueUSD: safeFormat(polValueUSD, 8),
				lvlValueUSD: safeFormat(lvlValueUSD, 8),
				daiBalance: daiBalance,
				registered: user.activated || false,
				index: user.index ? user.index.toString() : '0',
				refclimed: user.refclimed ? user.refclimed.toString() : '0',
				leftPoints: user.leftPoints ? user.leftPoints.toString() : '0',
				rightPoints: user.rightPoints ? user.rightPoints.toString() : '0',
				lastClaimTime: user.lastClaimTime ? user.lastClaimTime.toString() : '0',
				lastMonthlyClaim: user.lastMonthlyClaim ? user.lastMonthlyClaim.toString() : '0',
				totalMonthlyRewarded: user.totalMonthlyRewarded ? user.totalMonthlyRewarded.toString() : '0',
				depositedAmount: user.depositedAmount ? user.depositedAmount.toString() : '0'
			};
			
			// ذخیره در cache
			try {
				sessionStorage.setItem(cacheKey, JSON.stringify({
					data: profile,
					timestamp: Date.now()
				}));
			} catch (e) {
				console.warn('Could not cache user profile:', e);
			}
			
			return profile;
		} catch (error) {
			console.error('Central: Error fetching user profile:', error);
			throw error; // خطا را به بالا پاس بده، نه اطلاعات پیش‌فرض
		}
	});
};

// تابع مرکزی دریافت قیمت‌ها
window.getPrices = async function() {
	return await preventConcurrentCalls('getPrices', async () => {
		try {
			let contract = null;
			try {
				const connection = await window.connectWallet();
				if (connection && connection.contract) {
					contract = connection.contract;
				}
			} catch (e) {}

			let cpaPriceUSD = null;
			if (contract && typeof contract.getTokenPrice === 'function') {
				try {
					const price = await contract.getTokenPrice();
					cpaPriceUSD = window.formatTokenPrice ? window.formatTokenPrice(price) : ethers.formatUnits(price, 18);
				} catch (e) {
					console.error('Error getting token price:', e);
				}
			}
			return { cpaPriceUSD };
		} catch (error) {
			console.error('Error in getPrices:', error);
			return { cpaPriceUSD: null };
		}
	});
};

// تابع مرکزی دریافت آمار قرارداد
window.getContractStats = async function() {
	try {
		const connection = await window.connectWallet();
		if (!connection || !connection.contract) {
			throw new Error('No wallet connection available');
		}
		
		const { contract } = connection;
		
		// استفاده از retry mechanism برای عملیات‌های قرارداد
		const getStatsWithRetry = async () => {
			// دریافت آمار به صورت موازی با مدیریت خطا
			const [
				totalSupply,
				pointValue
			] = await Promise.all([
				window.retryRpcOperation(() => contract.totalSupply(), 2),
				window.retryRpcOperation(() => contract.getPointValue(), 2)
			]);
			
			// دریافت wallets به صورت جداگانه (متغیر state)
			let wallets = 0n;
			try {
				if (typeof contract.wallets === 'function') {
					wallets = await window.retryRpcOperation(() => contract.wallets(), 2);
				} else {
					wallets = await window.retryRpcOperation(() => contract.wallets, 2);
				}
			} catch (e) {
				console.warn('Could not fetch wallets:', e);
				throw new Error('Wallets data not available');
			}
			
			// دریافت totalClaimableBinaryPoints به صورت جداگانه (متغیر state)
			let totalClaimableBinaryPoints = 0n;
			try {
				if (typeof contract.totalClaimableBinaryPoints === 'function') {
					totalClaimableBinaryPoints = await window.retryRpcOperation(() => contract.totalClaimableBinaryPoints(), 2);
				} else {
					totalClaimableBinaryPoints = await window.retryRpcOperation(() => contract.totalClaimableBinaryPoints, 2);
				}
			} catch (e) {
				console.warn('Could not fetch totalClaimableBinaryPoints:', e);
				throw new Error('Total claimable binary points data not available');
			}
			
			return { totalSupply, pointValue, wallets, totalClaimableBinaryPoints };
		};
		
		// استفاده از retry mechanism
		const stats = await window.retryRpcOperation(getStatsWithRetry, 2);
		if (!stats) {
			throw new Error('Contract stats not available');
		}
		
		const { totalSupply, pointValue, wallets, totalClaimableBinaryPoints } = stats;
		
		// استفاده از totalClaimableBinaryPoints به جای totalPoints
		const totalPoints = totalClaimableBinaryPoints;
		
		// محاسبه circulatingSupply به صورت تقریبی
		let circulatingSupply = totalSupply;
		let contractBalance = 0n;
		let contractTokenBalance = 0n;
		try {
			// دریافت provider از contractConfig
			const { provider } = await window.connectWallet();
			if (provider) {
				// استفاده از تابع getContractMaticBalance از قرارداد
				try {
					contractBalance = await contract.getContractMaticBalance();
				} catch (e) {
					// fallback به provider.getBalance
					contractBalance = await provider.getBalance(contract.target);
				}
				// محاسبه circulatingSupply = totalSupply - موجودی توکن قرارداد
				// نه موجودی POL قرارداد
				try {
					contractTokenBalance = await contract.balanceOf(contract.target);
				} catch (e) {
					throw new Error('Contract token balance not available');
				}
				circulatingSupply = totalSupply - contractTokenBalance;
			} else {
				console.warn('Provider not available, using total supply as circulating supply');
				circulatingSupply = totalSupply;
			}
		} catch (e) {
			console.warn('Could not calculate circulating supply, using total supply:', e);
			circulatingSupply = totalSupply;
		}
		
		// محاسبه binaryPool از totalPoints (تقریبی)
		const binaryPool = totalPoints;
		
		const result = {
			totalSupply: ethers.formatUnits(totalSupply, 18),
			circulatingSupply: ethers.formatUnits(circulatingSupply, 18),
			binaryPool: ethers.formatUnits(binaryPool, 18),
			totalPoints: totalClaimableBinaryPoints ? ethers.formatUnits(totalClaimableBinaryPoints, 18) : '0',
			totalClaimableBinaryPoints: totalClaimableBinaryPoints ? ethers.formatUnits(totalClaimableBinaryPoints, 18) : '0',
			pointValue: ethers.formatUnits(pointValue, 18),
			rewardPool: ethers.formatEther(contractBalance), // استخر پاداش = موجودی POL قرارداد (نه توکن)
			contractTokenBalance: ethers.formatUnits(contractTokenBalance, 18) // موجودی توکن قرارداد
			
		};
		
		return result;
	} catch (error) {
		console.error('Central: Error fetching contract stats:', error);
		throw error; // خطا را به بالا پاس بده، نه اطلاعات پیش‌فرض
	}
};

// تابع مرکزی بررسی اتصال
window.checkConnection = async function() {
	return await preventConcurrentCalls('checkConnection', async () => {
		try {
			const connection = await window.connectWallet();
			if (!connection || !connection.provider || !connection.address) {
				throw new Error('No wallet connection available');
			}
			
			const { provider, address } = connection;
			const network = await provider.getNetwork();
			
			return {
				connected: true,
				address,
				network: network.name,
				chainId: network.chainId
			};
		} catch (error) {
			return {
				connected: false,
				error: error.message
			};
		}
	});
};

// تابع debug برای تست circulatingSupply
window.debugCirculatingSupply = async function() {
	try {
		const { contract } = await window.connectWallet();
		
		// تست مستقیم circulatingSupply
		try {
			const directCirculatingSupply = await contract.circulatingSupply();
		} catch (e) {
		}
		
		// تست totalSupply
		try {
			const totalSupply = await contract.totalSupply();
		} catch (e) {
		}
		
		// تست contract balance
		try {
			const contractBalance = await contract.balanceOf(contract.target);
		} catch (e) {
		}
		
		// تست deployer balance
		try {
			const deployer = await contract.deployer();
			const deployerBalance = await contract.balanceOf(deployer);
		} catch (e) {
		}
		
	} catch (error) {
		console.error('Debug: Error testing circulating supply:', error);
	}
};

// تابع debug برای تست موجودی POL قرارداد
window.debugContractPolBalance = async function() {
	try {
		const { contract, provider } = await window.connectWallet();
		
		// تست موجودی POL قرارداد
		try {
			const polBalance = await provider.getBalance(contract.target);
		} catch (e) {
		}
		
		// تست تابع getContractMaticBalance از قرارداد
		try {
			const contractPolBalance = await contract.getContractMaticBalance();
		} catch (e) {
		}
		
	} catch (error) {
		console.error('Debug: Error testing contract POL balance:', error);
	}
};



// تابع بارگذاری آمار شبکه
async function loadNetworkStats(contract) {
	try {
		// فقط از توابع موجود استفاده کن
		const totalClaimableBinaryPoints = await contract.totalClaimableBinaryPoints().catch(() => 0n);
		
		console.log('Network stats loaded successfully');
		return {
			totalClaimableBinaryPoints
		};
	} catch (error) {
		console.error('Error loading network stats:', error);
		return null;
	}
}

// تابع برداشت پاداش‌های باینری
window.claimRewards = async function() {
	try {
		const { contract } = await window.connectWallet();
		
		const tx = await window.retryRpcOperation(() => contract.claim(), 2);
		const receipt = await window.retryRpcOperation(() => tx.wait(), 3);
		
		return {
			success: true,
			transactionHash: receipt.hash,
			blockNumber: receipt.blockNumber
		};
	} catch (error) {
		console.error('Central: Error claiming rewards:', error);
		throw error;
	}
};

// تابع برداشت پاداش ماهانه
window.claimMonthlyReward = async function() {
	try {
		const { contract } = await window.connectWallet();
		const tx = await window.retryRpcOperation(() => contract.claimMonthlyReward(), 2);
		const receipt = await window.retryRpcOperation(() => tx.wait(), 3);
		return {
			success: true,
			transactionHash: receipt.hash,
			blockNumber: receipt.blockNumber
		};
	} catch (error) {
		console.error('Central: Error claiming monthly reward:', error);
		throw error;
	}
};

// تابع دریافت قیمت DAI - همیشه 1 دلار
window.fetchPolUsdPrice = async function() {
	return 1.0; // DAI همیشه 1 دلار است
};

// تابع نمایش تاریخچه قیمت‌ها
window.showPriceHistory = function() {
	if (!window.priceHistoryManager) {
		console.log('❌ Price history manager not available');
		return;
	}
	
	console.log('📊 === PRICE HISTORY ===');
	console.log('Token Price History:', window.priceHistoryManager.tokenHistory);
	console.log('Point Price History:', window.priceHistoryManager.pointHistory);
	
	// نمایش آمار
	const tokenStats = window.priceHistoryManager.getHistoryStats('token', 'day');
	const pointStats = window.priceHistoryManager.getHistoryStats('point', 'day');
	
	console.log('📈 Token Price Stats (24h):', tokenStats);
	console.log('📈 Point Price Stats (24h):', pointStats);
	
	return {
		tokenHistory: window.priceHistoryManager.tokenHistory,
		pointHistory: window.priceHistoryManager.pointHistory,
		tokenStats,
		pointStats
	};
};

// تابع پاک کردن تاریخچه قیمت‌ها
window.clearPriceHistory = function() {
	if (!window.priceHistoryManager) {
		console.log('❌ Price history manager not available');
		return;
	}
	
	window.priceHistoryManager.clearHistory();
	console.log('🗑️ Price history cleared');
};

// تابع نمایش تاریخچه قیمت‌ها به صورت جدول
window.displayPriceHistoryTable = function() {
	if (!window.priceHistoryManager) {
		console.log('❌ Price history manager not available');
		return;
	}
	
	console.log('📊 === PRICE HISTORY TABLE ===');
	
	// نمایش آخرین 10 قیمت توکن
	console.log('🪙 Last 10 Token Prices:');
	const lastTokenPrices = window.priceHistoryManager.tokenHistory.slice(-10);
	lastTokenPrices.forEach((entry, index) => {
		const date = new Date(entry.timestamp).toLocaleString('fa-IR');
		console.log(`${index + 1}. ${entry.price} DAI - ${date}`);
	});
	
	// نمایش آخرین 10 قیمت پوینت
	console.log('💎 Last 10 Point Prices:');
	const lastPointPrices = window.priceHistoryManager.pointHistory.slice(-10);
	lastPointPrices.forEach((entry, index) => {
		const date = new Date(entry.timestamp).toLocaleString('fa-IR');
		console.log(`${index + 1}. ${entry.price} CPA - ${date}`);
	});
	
	// نمایش آمار
	const tokenStats = window.priceHistoryManager.getHistoryStats('token', 'day');
	const pointStats = window.priceHistoryManager.getHistoryStats('point', 'day');
	
	console.log('📈 24h Statistics:');
	console.log('Token - Min:', tokenStats.min, 'Max:', tokenStats.max, 'Avg:', tokenStats.avg.toFixed(6));
	console.log('Point - Min:', pointStats.min, 'Max:', pointStats.max, 'Avg:', pointStats.avg.toFixed(6));
};

// تابع export تاریخچه قیمت‌ها
window.exportPriceHistory = function() {
	if (!window.priceHistoryManager) {
		console.log('❌ Price history manager not available');
		return;
	}
	
	const exportData = {
		tokenHistory: window.priceHistoryManager.tokenHistory,
		pointHistory: window.priceHistoryManager.pointHistory,
		exportDate: new Date().toISOString(),
		totalTokenEntries: window.priceHistoryManager.tokenHistory.length,
		totalPointEntries: window.priceHistoryManager.pointHistory.length
	};
	
	const jsonString = JSON.stringify(exportData, null, 2);
	
	// ایجاد فایل برای دانلود
	const blob = new Blob([jsonString], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `price-history-${new Date().toISOString().split('T')[0]}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	
	console.log('📤 Price history exported successfully');
	return exportData;
};

// تابع نمایش آمار تاریخچه قیمت‌ها
window.showPriceHistoryStats = function() {
	if (!window.priceHistoryManager) {
		console.log('❌ Price history manager not available');
		return;
	}
	
	const tokenCount = window.priceHistoryManager.tokenHistory.length;
	const pointCount = window.priceHistoryManager.pointHistory.length;
	
	console.log('📊 === PRICE HISTORY STATISTICS ===');
	console.log(`🪙 Token Prices: ${tokenCount} entries`);
	console.log(`💎 Point Prices: ${pointCount} entries`);
	
	if (tokenCount > 0) {
		const lastToken = window.priceHistoryManager.tokenHistory[tokenCount - 1];
		const firstToken = window.priceHistoryManager.tokenHistory[0];
		const tokenTimeSpan = new Date(lastToken.timestamp) - new Date(firstToken.timestamp);
		const tokenHours = Math.round(tokenTimeSpan / (1000 * 60 * 60));
		console.log(`🪙 Token History: ${tokenHours} hours of data`);
		console.log(`🪙 Latest Token Price: ${lastToken.price} DAI`);
	}
	
	if (pointCount > 0) {
		const lastPoint = window.priceHistoryManager.pointHistory[pointCount - 1];
		const firstPoint = window.priceHistoryManager.pointHistory[0];
		const pointTimeSpan = new Date(lastPoint.timestamp) - new Date(firstPoint.timestamp);
		const pointHours = Math.round(pointTimeSpan / (1000 * 60 * 60));
		console.log(`💎 Point History: ${pointHours} hours of data`);
		console.log(`💎 Latest Point Price: ${lastPoint.price} CPA`);
	}
	
	return {
		tokenCount,
		pointCount,
		tokenHistory: window.priceHistoryManager.tokenHistory,
		pointHistory: window.priceHistoryManager.pointHistory
	};
};

(async () => {
  try {
	const result = await window.connectWallet();
	console.log('Wallet:', result);
  } catch (e) {
	console.error('ConnectWallet Error:', e);
  }
})();



// تابع مدیریت خطاهای RPC
window.handleRpcError = function(error, operation = 'unknown') {
	console.warn(`RPC Error in ${operation}:`, error);
	
	// اگر خطای eth_getLogs بود، آن را نادیده بگیر
	if (error.message && error.message.includes('eth_getLogs')) {
		console.warn('Ignoring eth_getLogs error - this is common on some RPC endpoints');
		return null;
	}
	
	// Handle "could not coalesce error" - این خطا معمولاً قابل نادیده گرفتن است
	if (error.message && error.message.includes('could not coalesce error')) {
		console.warn('Coalesce error - ignoring...');
		return null;
	}
	
	// اگر خطای timeout بود
	if (error.code === 'TIMEOUT' || error.message.includes('timeout') || 
		error.message.includes('Request timeout error') || error.code === -32064) {
		console.warn('RPC timeout - retrying...');
		return 'retry';
	}
	
	// اگر خطای rate limit بود
	if (error.code === -32005 || error.message.includes('rate limit')) {
		console.warn('RPC rate limit - waiting before retry...');
		return 'wait';
	}
	
	// Handle MetaMask "already processing" error
	if (error.code === -32002 || error.message.includes('Already processing eth_requestAccounts')) {
		console.warn('MetaMask is already processing request - waiting...');
		return 'wait';
	}
	
	// Handle user rejected transaction
	if (error.code === 4001 || error.message.includes('user rejected') || error.message.includes('User denied transaction signature')) {
		console.warn('User rejected transaction - no retry needed');
		return null;
	}
	
	// Handle internal JSON-RPC errors
	if (error.code === -32603 || error.message.includes('Internal JSON-RPC error')) {
		console.warn('Internal JSON-RPC error - retrying...');
		return 'retry';
	}
	
	// Handle network errors
	if (error.code === 'NETWORK_ERROR' || error.message.includes('network') || 
		error.message.includes('fetch')) {
		console.warn('Network error - retrying...');
		return 'retry';
	}
	
	// Handle connection errors
	if (error.code === 'CONNECTION_ERROR' || error.message.includes('connection')) {
		console.warn('Connection error - retrying...');
		return 'retry';
	}
	
	// سایر خطاها
	return 'error';
};

// تابع retry برای عملیات RPC
window.retryRpcOperation = async function(operation, maxRetries = 3) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await operation();
		} catch (error) {
			// Handle specific error types
			const errorType = window.handleRpcError(error, 'retry');
			
			if (errorType === null) {
				// Error should be ignored, don't retry
				throw error;
			}
			
			if (errorType === 'wait') {
				// کاهش زمان انتظار قبل از retry
				await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
				continue;
			}
			
			if (i === maxRetries - 1) {
				// Last attempt, throw the error
				throw error;
			}
			
			// کاهش delay retry برای سرعت بیشتر
			await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
		}
	}
};

// تابع بهبود یافته برای مدیریت خطاهای MetaMask
window.handleMetaMaskError = function(error) {
	console.warn('MetaMask Error:', error);
	
	// اگر کاربر تراکنش را رد کرد
	if (error.code === 4001 || error.message.includes('user rejected') || error.message.includes('User denied transaction signature')) {
		return {
			type: 'user_rejected',
			message: 'کاربر تراکنش را رد کرد',
			shouldRetry: false
		};
	}
	
	// اگر MetaMask در حال پردازش است
	if (error.code === -32002 || error.message.includes('Already processing eth_requestAccounts')) {
		return {
			type: 'processing',
			message: 'MetaMask در حال پردازش درخواست قبلی است',
			shouldRetry: true,
			delay: 2000
		};
	}
	
	// اگر خطای شبکه است
	if (error.code === 'NETWORK_ERROR' || error.message.includes('network')) {
		return {
			type: 'network',
			message: 'خطای شبکه - لطفاً اتصال اینترنت خود را بررسی کنید',
			shouldRetry: true,
			delay: 5000
		};
	}
	
	// سایر خطاها
	return {
		type: 'unknown',
		message: 'خطای ناشناخته در MetaMask',
		shouldRetry: false
	};
};



// تابع امن برای query کردن events
window.safeQueryEvents = async function(contract, eventFilter, fromBlock = 'latest', toBlock = 'latest') {
	try {
		// اگر fromBlock برابر 'latest' است، فقط آخرین block را query کن
		if (fromBlock === 'latest') {
			const currentBlock = await contract.provider.getBlockNumber();
			fromBlock = currentBlock;
			toBlock = currentBlock;
		}
		
		// اگر fromBlock برابر 0 است، از آخرین 1000 block شروع کن
		if (fromBlock === 0 || fromBlock === '0x0') {
			const currentBlock = await contract.provider.getBlockNumber();
			fromBlock = Math.max(0, currentBlock - 1000);
			toBlock = currentBlock;
		}
		
		return await contract.queryFilter(eventFilter, fromBlock, toBlock);
	} catch (error) {
		const errorType = window.handleRpcError(error, 'event_query');
		
		if (errorType === null) {
			// Error should be ignored
			return [];
		}
		
		if (errorType === 'retry' || errorType === 'wait') {
			// Retry with a smaller block range
			try {
				const currentBlock = await contract.provider.getBlockNumber();
				const smallerFromBlock = Math.max(0, currentBlock - 100);
				return await contract.queryFilter(eventFilter, smallerFromBlock, currentBlock);
			} catch (retryError) {
				console.warn('Event query retry failed:', retryError);
				return [];
			}
		}
		
		throw error;
	}
};


function setupViewerMode() {
	// شبیه‌سازی اتصال به استریم
	setTimeout(() => {
		addChatMessage('system', 'به لایو استریم آموزشی خوش آمدید!');
	}, 1000);
}

// تابع مدیریت خطاهای اتصال کیف پول
window.handleWalletConnectionError = function(error) {
	// Handle MetaMask "already processing" error
	if (error.code === -32002 || error.message.includes('Already processing eth_requestAccounts')) {
		console.log('MetaMask is already processing connection request');
		return {
			type: 'processing',
			message: 'MetaMask is processing your request. Please wait...',
			shouldRetry: true,
			retryDelay: 2000
		};
	}
	
	// Handle user rejection
	if (error.code === 4001 || error.message.includes('User rejected')) {
		return {
			type: 'rejected',
			message: 'Connection was rejected by user',
			shouldRetry: false
		};
	}
	
	// Handle network errors
	if (error.code === 'NETWORK_ERROR' || error.message.includes('network')) {
		return {
			type: 'network',
			message: 'Network error occurred',
			shouldRetry: true,
			retryDelay: 5000
		};
	}
	
	// Default error
	return {
		type: 'unknown',
		message: error.message || 'Unknown error occurred',
		shouldRetry: true,
		retryDelay: 3000
	};
};


// Event listener برای پاکسازی intervals هنگام خروج از صفحه
window.addEventListener('beforeunload', function() {
	if (window.priceUpdateInterval) {
		clearInterval(window.priceUpdateInterval);
	}
	if (window.connectionCheckInterval) {
		clearInterval(window.connectionCheckInterval);
	}
	window.cleanupNetworkIntervals();
});

async function refreshTotalSupply() {
  try {
	const { contract } = await window.connectWallet();
	const totalSupply = await contract.totalSupply();
	const contractBalance = await contract.balanceOf(contract.target); // contract.target = address(this)
	const tokenPrice = await contract.getTokenPrice();

	const totalSupplyNum = Number(ethers.formatUnits(totalSupply, 18));
	const contractBalanceNum = Number(ethers.formatUnits(contractBalance, 18));
			const tokenPriceNum = Number(ethers.formatUnits(tokenPrice, 18)); // قیمت با 18 رقم اعشار (DAI)

	const elTotalSupply = document.getElementById('total-supply');
	if (elTotalSupply) elTotalSupply.innerText = totalSupplyNum.toLocaleString('en-US', {maximumFractionDigits: 4}); // حذف پسوند CPA
	const elContractBalance = document.getElementById('contract-balance');
	if (elContractBalance) elContractBalance.innerText = contractBalanceNum.toLocaleString('en-US', {maximumFractionDigits: 4}); // حذف پسوند CPA
	document.getElementById('supply-diff').innerText = (totalSupplyNum - contractBalanceNum).toLocaleString('en-US', {maximumFractionDigits: 4}); // حذف پسوند CPA
	document.getElementById('total-supply-value').innerText = (totalSupplyNum * tokenPriceNum).toLocaleString('en-US', {maximumFractionDigits: 2}); // حذف پسوند DAI
  } catch (e) {
	document.getElementById('total-supply').innerText = 'خطا';
	document.getElementById('contract-balance').innerText = 'خطا';
	document.getElementById('supply-diff').innerText = 'خطا';
	document.getElementById('total-supply-value').innerText = 'خطا';
  }
}

// Make updateDashboardStats globally accessible
window.updateDashboardStats = async function() {
  // Prevent multiple simultaneous calls
  if (window._dashboardUpdateInProgress) {
	console.debug('⏳ Dashboard update already in progress, skipping...');
	return;
  }
  
  window._dashboardUpdateInProgress = true;
  
  try {
	console.log('🔄 Starting dashboard stats update...');
	
	// Ensure we have a valid connection
	let contract;
	if (!window.contractConfig || !window.contractConfig.contract) {
	  console.log('📡 Connecting wallet for dashboard stats...');
	  const connection = await window.connectWallet();
	  contract = connection.contract;
	} else {
	  contract = window.contractConfig.contract;
	}
	
	if (!contract) {
	  throw new Error('No contract available');
	}
	
	console.log('✅ Contract connection established for dashboard stats');
	
	// Check if contract has required functions
	console.log('🔍 Checking contract functions...');
	const hasTotalSupply = typeof contract.totalSupply === 'function';
	const hasTotalPoints = typeof contract.totalClaimableBinaryPoints === 'function';
	const hasWallets = typeof contract.wallets === 'function';
	const hasGetTokenPrice = typeof contract.getTokenPrice === 'function';
	const hasGetPointValue = typeof contract.getPointValue === 'function';
	
	console.log('📋 Contract function availability:', {
	  totalSupply: hasTotalSupply,
	  totalClaimableBinaryPoints: hasTotalPoints,
	  wallets: hasWallets,
	  getTokenPrice: hasGetTokenPrice,
	  getPointValue: hasGetPointValue
	});
	
	// Test basic contract call
	try {
	  console.log('🧪 Testing basic contract call...');
	  const symbol = await contract.symbol();
	  console.log('✅ Basic contract call successful, symbol:', symbol);
	} catch (e) {
	  console.error('❌ Basic contract call failed:', e);
	}

	// Helper function to safely update element (بروزرسانی هوشمند)
		const safeUpdate = (id, value) => {
		// استفاده از Dashboard Loading Manager برای بروزرسانی smooth
		if (window.dashboardLoadingManager) {
			// حذف loading state و بروزرسانی مقدار
			window.dashboardLoadingManager.setLoading(id, false);
		}
		
		// استفاده از سیستم بروزرسانی هوشمند - فقط در صورت تغییر واقعی
		if (window.smartSafeUpdate) {
			return window.smartSafeUpdate(id, value);
		} else {
			// Fallback برای حالت عادی
			const el = document.getElementById(id);
			if (el && value !== undefined && value !== null && value !== 'Error' && value !== 'در دسترس نیست') {
				if (el.innerText !== value) {
					el.innerText = value;
				}
			}
		}
	};

	// Update blockchain information cards
	

	// حذف loading state در بروزرسانی‌ها - فقط مقادیر قبلی را نگه دار
	// عدم نمایش "در حال بارگذاری..." در بروزرسانی‌های عادی

	// TOTAL SUPPLY (circulating supply)
	try {
	  console.log('📊 Fetching total supply...');
	  
	  // افزایش timeout از ۵ ثانیه به ۷ ثانیه
	  const totalSupplyPromise = contract.totalSupply();
	  const timeoutPromise = new Promise((_, reject) => 
		setTimeout(() => reject(new Error('Total supply fetch timeout')), 7000)
	  );
	  
	  const totalSupply = await Promise.race([totalSupplyPromise, timeoutPromise]);
	  const formattedSupply = parseFloat(ethers.formatUnits(totalSupply, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
	  safeUpdate('circulating-supply', formattedSupply); // حذف پسوند CPA
	  console.log('✅ Total supply updated:', formattedSupply);

	} catch (e) {
	  console.error('❌ Error fetching total supply:', e);
	  console.error('❌ Error details:', {
		message: e.message,
		code: e.code,
		stack: e.stack
	  });
	  safeUpdate('circulating-supply', 'خطا در دریافت مقدار');
	}

	// TOTAL POINTS
	try {
	  console.log('🎯 Fetching total points...');
	  const totalPoints = await contract.totalClaimablePoints();
	  // استفاده از ethers.formatUnits برای تبدیل صحیح BigInt به عدد
	  const formattedPoints = parseInt(ethers.formatUnits(totalPoints, 0)).toLocaleString('en-US');
	  safeUpdate('total-points', formattedPoints);
	  console.log('✅ Total points updated:', formattedPoints);

	} catch (e) {
	  console.error('❌ Error fetching total points:', e);
	  safeUpdate('total-points', 'Error');
	}

	// CPA BALANCE (contract's own token balance)
	try {
	  console.log('🏦 Fetching contract token balance...');
	  const contractTokenBalance = await contract.balanceOf(contract.target);
	  const formattedBalance = parseFloat(ethers.formatUnits(contractTokenBalance, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
	  safeUpdate('contract-token-balance', formattedBalance); // حذف پسوند CPA
	  console.log('✅ Contract token balance updated:', formattedBalance);

	} catch (e) {
	  console.error('❌ Error fetching contract token balance:', e);
	  safeUpdate('contract-token-balance', 'Error');
	}

	// HELP FUND (cashback)
	try {
	  console.log('💝 Fetching cashback...');
	  let cashback;
	  
	  // Try different possible function names
	  if (typeof contract.cashBack === 'function') {
		cashback = await contract.cashBack();
	  } else if (typeof contract.cashback === 'function') {
		cashback = await contract.cashback();
	  } else {
		// If no cashback function exists, use 0
		cashback = 0n;
	  }
	  
	  const formattedCashback = parseFloat(ethers.formatUnits(cashback, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
	  safeUpdate('dashboard-cashback-value', formattedCashback); // حذف پسوند CPA
	  console.log('✅ Cashback updated:', formattedCashback);

	} catch (e) {
	  console.error('❌ Error fetching cashback:', e);
	  safeUpdate('dashboard-cashback-value', 'N/A');
	}

// DAI CONTRACT BALANCE - Using contract's getContractDAIBalance function
	try {
  console.log('💵 Fetching DAI contract balance...');
	  let daiBalance;
	  
	  // Try different possible function names (corrected function name)
	  if (typeof contract.getContractdaiBalance === 'function') {
		daiBalance = await contract.getContractdaiBalance();
	  } else if (typeof contract.getContractDAIBalance === 'function') {
		daiBalance = await contract.getContractDAIBalance();
	  } else {
		// Fallback to direct DAI contract call (for testing)
		if (typeof DAI_ADDRESS !== 'undefined' && typeof DAI_ABI !== 'undefined') {
		  const daiContract = new ethers.Contract(DAI_ADDRESS, DAI_ABI, contract.provider);
		  daiBalance = await daiContract.balanceOf(contract.target);
		} else {
		  daiBalance = 0n;
		}
	  }
	  
  // DAI has 18 decimals
  const formattedDai = parseFloat(ethers.formatUnits(daiBalance, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
  safeUpdate('dashboard-dai-balance', formattedDai);
  console.log('✅ DAI contract balance updated:', formattedDai);

	} catch (e) {
	  console.error('❌ Error fetching DAI balance:', e);
	  safeUpdate('dashboard-dai-balance', 'N/A');
	}

	// Update last update timestamp
	const now = new Date();
	const timeString = now.toLocaleTimeString('fa-IR', { 
	  hour: '2-digit', 
	  minute: '2-digit', 
	  second: '2-digit' 
	});
	safeUpdate('blockchain-last-update', timeString);

	// POINT VALUE (ارزش هر پوینت)
	try {
	  console.log('💎 Fetching point value...');
	  const pointValue = await contract.getPointValue();
	  const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
	  const formattedPointValue = pointValueNum.toLocaleString('en-US', {maximumFractionDigits: 6});
	  safeUpdate('dashboard-point-value', formattedPointValue); // حذف پسوند CPA
	  console.log('✅ Point value updated:', formattedPointValue);
	  
	  // Save point price to history
	  if (window.priceHistoryManager) {
		await window.priceHistoryManager.addPointPrice(pointValueNum);
		console.log('📊 Point price saved to history');
	  }
	} catch (e) {
	  console.error('❌ Error fetching point value:', e);
	  safeUpdate('dashboard-point-value', 'Error');
	}

	// TOKEN PRICE (قیمت توکن CPA)
	try {
	  console.log('💲 Fetching token price...');
	  const tokenPrice = await contract.getTokenPrice();
	  const tokenPriceNum = parseFloat(ethers.formatUnits(tokenPrice, 18));
	  let formattedTokenPrice;
	  if (tokenPriceNum < 0.0001) {
		formattedTokenPrice = tokenPriceNum.toExponential(2);
	  } else {
		formattedTokenPrice = tokenPriceNum.toLocaleString('en-US', {maximumFractionDigits: 6});
	  }
	  safeUpdate('dashboard-token-price', formattedTokenPrice); // حذف پسوند DAI
	  console.log('✅ Token price updated:', formattedTokenPrice);
	  
	  // Save token price to history
	  if (window.priceHistoryManager) {
		await window.priceHistoryManager.addTokenPrice(tokenPriceNum);
		console.log('📊 Token price saved to history');
	  }
	} catch (e) {
	  console.error('❌ Error fetching token price:', e);
	  safeUpdate('dashboard-token-price', 'Error');
	}

	// WALLET COUNT (تعداد ولت‌های متصل)
	try {
	  console.log('👛 Fetching wallets count...');
	  const walletsCount = await contract.wallets();
	  safeUpdate('dashboard-wallets-count', walletsCount.toString());
	  console.log('✅ Wallets count updated:', walletsCount.toString());
	} catch (e) {
	  console.error('❌ Error fetching wallets count:', e);
	  safeUpdate('dashboard-wallets-count', 'Error');
	}

	// REGISTRATION PRICE (قیمت ثبت‌نام)
	try {
	  console.log('🎫 Fetching registration price...');
	  const registrationPrice = await window.getRegPrice(contract);
	  const formattedRegPrice = parseFloat(ethers.formatUnits(registrationPrice, 18)).toLocaleString('en-US', {maximumFractionDigits: 0});
	  safeUpdate('dashboard-registration-price', formattedRegPrice); // حذف پسوند CPA
	  console.log('✅ Registration price updated:', formattedRegPrice);
	} catch (e) {
	  console.error('❌ Error fetching registration price:', e);
	  safeUpdate('dashboard-registration-price', 'Error');
	}

	console.log('🎉 Dashboard stats update completed successfully!');
	
	// نمایش خلاصه تاریخچه قیمت‌ها
	if (window.priceHistoryManager) {
	  const tokenCount = window.priceHistoryManager.tokenHistory.length;
	  const pointCount = window.priceHistoryManager.pointHistory.length;
	  console.log(`📊 Price History Summary: ${tokenCount} token prices, ${pointCount} point prices stored`);
	}

  } catch (e) {
	console.error('❌ Error updating dashboard stats:', e);
	// اگر خطا داشتیم، همه را Error بگذار
	const elements = ['circulating-supply', 'total-points', 'contract-token-balance', 'dashboard-cashback-value', 'dashboard-dai-balance', 'dashboard-wallets-count', 'dashboard-registration-price'];
	elements.forEach(id => {
	  const el = document.getElementById(id);
	  if (el) el.innerText = 'Error';
	});
  } finally {
	// Always clear the progress flag
	window._dashboardUpdateInProgress = false;
	console.log('🏁 Dashboard update process finished');
  }
}

// اجرا در ابتدای بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
  // Initial update after 2 seconds
  // setTimeout غیرفعال شد - هیچ بروزرسانی خودکار نیست
  // setTimeout(async () => {
	// try {
	//   const connection = await window.connectWallet();
	//   await updateDashboardStats();
	// } catch (error) {
	//   console.error('❌ Error in initial setup:', error);
	//   // Show error in UI
	//   const elements = ['circulating-supply', 'total-points', 'contract-token-balance', 'dashboard-cashback-value', 'dashboard-dai-balance', 'dashboard-wallets-count', 'dashboard-registration-price'];
	//   elements.forEach(id => {
	// 	const el = document.getElementById(id);
	// 	if (el) el.innerText = 'Connection Error';
	//   });
	// }
  // }, 2000);
  
  // سیستم مرکزی جایگزین شده - این interval غیرفعال شد
  window._blockchainInfoIntervalSet = true; // جلوگیری از ایجاد interval جدید
  console.log('✅ سیستم مرکزی مدیریت blockchain info را انجام می‌دهد');
});


// Example for all assignments:
const elChartLvlUsd = document.getElementById('chart-lvl-usd');
if (elChartLvlUsd) elChartLvlUsd.textContent = '';
const elChartLvlUsdChange = document.getElementById('chart-lvl-usd-change');
if (elChartLvlUsdChange) elChartLvlUsdChange.textContent = '';
const elPriceChartLastUpdate = document.getElementById('price-chart-last-update');
if (elPriceChartLastUpdate) elChartLvlUsdChange.textContent = '';


async function updatePriceChart() {
	try {
		// نمایش حالت لودینگ
		if (elChartLvlUsd) elChartLvlUsd.textContent = 'در حال دریافت...';
		// ... سایر المنت‌ها

		const prices = await window.getPrices();
		if (!prices || !prices.cpaPriceUSD || parseFloat(prices.cpaPriceUSD) <= 0) {
			if (elChartLvlUsd) elChartLvlUsd.textContent = 'در حال دریافت...';
			return;
		}
		if (elChartLvlUsd) elChartLvlUsd.textContent = prices.cpaPriceUSD;
		// ... سایر المنت‌ها
	} catch (e) {
		if (elChartLvlUsd) elChartLvlUsd.textContent = 'در حال دریافت...';
	}
}

// Returns the DAI balance of the main contract (CPA_ADDRESS) as a string in DAI units (18 decimals)
async function getContractDAIBalance() {
  if (typeof ethers === 'undefined') throw new Error('ethers.js not loaded');
  const provider = (window.contractConfig && window.contractConfig.contract && window.contractConfig.contract.provider)
	? window.contractConfig.contract.provider
	: (window.contractConfig && window.contractConfig.provider)
	  ? window.contractConfig.provider
	  : (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
  if (!provider) throw new Error('No provider');
  const daiContract = new ethers.Contract(DAI_ADDRESS, DAI_ABI, provider);
  const balanceRaw = await daiContract.balanceOf(CPA_ADDRESS);
  return ethers.formatUnits(balanceRaw, 18); // DAI has 18 decimals
}

// Backward compatibility (keep name on window if referenced elsewhere)
window.getContractDAIBalance = getContractDAIBalance;

// ... existing code ...
// Returns the raw totalClaimablePoints value (BigInt)
async function getTotalClaimableBinaryPoints() {
  if (typeof ethers === 'undefined') throw new Error('ethers.js not loaded');
  const provider = (window.contractConfig && window.contractConfig.contract && window.contractConfig.contract.provider)
	? window.contractConfig.contract.provider
	: (window.contractConfig && window.contractConfig.provider)
	  ? window.contractConfig.provider
	  : (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
  if (!provider) throw new Error('No provider');
  const contract = new ethers.Contract(CPA_ADDRESS, CPA_ABI, provider);
  const pointsRaw = await contract.totalClaimablePoints();
  return pointsRaw; // BigInt or string
}
// Returns the integer value (no decimals)
async function getTotalClaimableBinaryPointsInteger() {
  const pointsRaw = await getTotalClaimableBinaryPoints();
  // استفاده از ethers.formatUnits برای تبدیل صحیح BigInt به عدد
  return parseInt(ethers.formatUnits(pointsRaw, 0)).toString();
}
// ... existing code ...



// ... existing code ...
// Returns the CPA token balance of the contract using balanceOf(CPA_ADDRESS)
async function getContractTokenBalance() {
  if (typeof ethers === 'undefined') throw new Error('ethers.js not loaded');
  const provider = (window.contractConfig && window.contractConfig.contract && window.contractConfig.contract.provider)
	? window.contractConfig.contract.provider
	: (window.contractConfig && window.contractConfig.provider)
	  ? window.contractConfig.provider
	  : (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
  if (!provider) throw new Error('No provider');
  const contract = new ethers.Contract(CPA_ADDRESS, CPA_ABI, provider);
  const tokenRaw = await contract.balanceOf(CPA_ADDRESS);
  return ethers.formatUnits(tokenRaw, 18); // returns as string, e.g. '123.456789012345678901'
}
// ... existing code ...

// Global cache for public contract stats
window.contractStats = {
  totalPoints: null,
  daiBalance: null,
  tokenBalance: null,
  wallets: null,
  totalSupply: null,
  lastUpdate: 0
};

// Update all public contract stats in one network call
async function updateContractStats() {
  try {
	const provider = (window.contractConfig && window.contractConfig.contract && window.contractConfig.contract.provider)
	  ? window.contractConfig.contract.provider
	  : (window.contractConfig && window.contractConfig.provider)
		? window.contractConfig.provider
		: (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
	if (!provider) throw new Error('No provider');
	const contract = new ethers.Contract(CPA_ADDRESS, CPA_ABI, provider);
	// Total Points (integer, no decimals)
	window.contractStats.totalPoints = (await contract.totalClaimablePoints()).toString();
  // DAI Balance (calls helper)
  window.contractStats.daiBalance = await getContractDAIBalance();
	// Token Balance (calls helper)
	window.contractStats.tokenBalance = await getContractTokenBalance();
	// Wallets count
	window.contractStats.wallets = (await contract.wallets()).toString();
	// Total Supply (as string, 18 decimals)
	window.contractStats.totalSupply = (await contract.totalSupply()).toString();
	// Timestamp
	window.contractStats.lastUpdate = Date.now();
  } catch (e) {
	console.error('Error updating contractStats:', e);
  }
}

// تابع نمایش قیمت با اعشار کامل
window.formatTokenPrice = function(priceWei) {
  if (!priceWei || priceWei === '0') return '0';
  let priceString = priceWei.toString();
  while (priceString.length < 18) priceString = '0' + priceString;
  if (priceString.length > 18) priceString = priceString.slice(-18);
  const result = '0.' + priceString;
  const numResult = parseFloat(result);
  if (numResult < 0.000001) {
	return numResult.toExponential(6);
  }
  return result;
}

// تابع بروزرسانی نمایش قیمت
async function updateTokenPriceDisplay() {
  try {
	if (!window.contractConfig || !window.contractConfig.contract) {
	  await window.connectWallet();
	  if (!window.contractConfig || !window.contractConfig.contract) {
		const el = document.getElementById('chart-lvl-usd');
		if (el) el.textContent = 'اتصال ناموفق';
		return;
	  }
	}
	const contract = window.contractConfig.contract;
	const tokenPrice = await contract.getTokenPrice();
	const priceFormatted = window.formatTokenPrice(tokenPrice);
	const el = document.getElementById('chart-lvl-usd');
	if (el) el.textContent = priceFormatted;
	// بروزرسانی point-value از قرارداد
	try {
	  const pointValue = await contract.getPointValue();
	  const pointValueNum = parseFloat(ethers.formatUnits(pointValue, 18));
	  const pointValueFormatted = pointValueNum < 0.000001 ? pointValueNum.toExponential(6) : pointValueNum.toFixed(2);
	  const el2 = document.getElementById('point-value');
	  if (el2) el2.textContent = pointValueFormatted; // حذف پسوند CPA
	} catch (error) {
	  // ...
	}
  } catch (error) {
	const el = document.getElementById('chart-lvl-usd');
	if (el) el.textContent = 'خطا در بارگذاری';
  }
}


// Set up interval for token price updates - غیرفعال شد
// if (!window._dashboardIntervalSet) {
//   setInterval(() => {
// 	updateTokenPriceDisplay();
//   }, 30000);
//   window._dashboardIntervalSet = true;
// }



// تابع global برای دریافت قیمت ثبت‌نام از قرارداد
window.getRegPrice = async function(contract) {
  try {
	if (!contract) {
	  if (window.contractConfig && window.contractConfig.contract) {
		contract = window.contractConfig.contract;
	  } else {
		const connection = await window.connectWallet();
		contract = connection.contract;
	  }
	}
	if (typeof contract.getRegPrice === 'function') {
	  return await contract.getRegPrice();
	} else {
	  return undefined;
	}
  } catch (e) {
	return undefined;
  }
};
// ... existing code ...

// فرض: تب‌ها با data-tab یا id مشخص می‌شوند
function saveActiveTab(tabId) {
  localStorage.setItem('activeTab', tabId);
}

// هنگام کلیک روی تب یا پس از تایید متامسک:
saveActiveTab('networkTab'); // یا هر شناسه‌ای که دارید

window.addEventListener('DOMContentLoaded', function() {
  const activeTab = localStorage.getItem('activeTab');
  if (activeTab) {
	if (typeof window.showTab === 'function') {
	  window.showTab(activeTab);
	}
	localStorage.removeItem('activeTab');
  }
});

// فرض: بعد از تایید تراکنش متامسک
saveActiveTab('networkTab');
// به جای رفرش، فقط داده‌های مورد نیاز را به‌روزرسانی کنید
if (typeof updateDashboardStats === 'function') {
  updateDashboardStats();
}
if (typeof window.showTab === 'function') {
  window.showTab('network');
}

// تابع تولید ID بر اساس ایندکس کاربر
window.generateCPAId = function(index) {
	if (!index || index === 0) return '0';
	
	// نمایش دقیق همان مقدار کنترکت بدون هیچ تغییری
	return index.toString();
};

// تابع نمایش ID در گوشه بالا سمت راست
window.displayCPAIdInCorner = function(index) {
	// حذف ID قبلی اگر وجود دارد
	const existingId = document.getElementById('cpa-id-corner');
	if (existingId) existingId.remove();
	
	if (!index || index === 0) return;
	
	const cpaId = window.generateCPAId(index);
	
	// ایجاد عنصر ID
	const idElement = document.createElement('div');
	idElement.id = 'cpa-id-corner';
	idElement.textContent = cpaId;
	idElement.style.cssText = `
		position: fixed;
		top: 10px;
		right: 10px;
		background: linear-gradient(135deg, #00ff88, #a786ff);
		color: #181c2a;
		padding: 8px 12px;
		border-radius: 8px;
		font-family: monospace;
		font-weight: bold;
		font-size: 0.9rem;
		z-index: 9999;
		box-shadow: 0 2px 8px rgba(0,255,136,0.3);
		border: 1px solid rgba(167,134,255,0.3);
		cursor: pointer;
		transition: all 0.3s ease;
	`;
	
	// اضافه کردن hover effect
	idElement.onmouseover = function() {
		this.style.transform = 'scale(1.05)';
		this.style.boxShadow = '0 4px 12px rgba(0,255,136,0.4)';
	};
	
	idElement.onmouseout = function() {
		this.style.transform = 'scale(1)';
		this.style.boxShadow = '0 2px 8px rgba(0,255,136,0.3)';
	};
	
	// کلیک برای کپی کردن
	idElement.onclick = function() {
		navigator.clipboard.writeText(cpaId);
		const originalText = this.textContent;
		this.textContent = 'کپی شد!';
		this.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
		setTimeout(() => {
			this.textContent = originalText;
			this.style.background = 'linear-gradient(135deg, #00ff88, #a786ff)';
		}, 1000);
	};
	
	document.body.appendChild(idElement);
};

// تابع به‌روزرسانی نمایش ID در تمام بخش‌ها
window.updateCPAIdDisplay = function(index) {
	const cpaId = window.generateCPAId(index);
	
	// به‌روزرسانی در پروفایل
	const profileIndexEl = document.getElementById('profile-index');
	if (profileIndexEl) {
		profileIndexEl.textContent = cpaId;
	}
	
	// به‌روزرسانی در داشبورد
	const dashboardIndexEl = document.getElementById('dashboard-user-index');
	if (dashboardIndexEl) {
		dashboardIndexEl.textContent = cpaId;
	}
	
	// نمایش بخش اطلاعات کاربر در داشبورد
	const dashboardUserInfo = document.getElementById('dashboard-user-info');
	if (dashboardUserInfo) {
		dashboardUserInfo.style.display = 'block';
		
		// به‌روزرسانی آدرس کیف پول
		const dashboardUserAddress = document.getElementById('dashboard-user-address');
		if (dashboardUserAddress && window.contractConfig && window.contractConfig.address) {
			dashboardUserAddress.textContent = window.shortenAddress ? window.shortenAddress(window.contractConfig.address) : window.contractConfig.address.substring(0, 6) + '...' + window.contractConfig.address.substring(38);
		}
		
		// به‌روزرسانی وضعیت
		const dashboardUserStatus = document.getElementById('dashboard-user-status');
		if (dashboardUserStatus) {
			dashboardUserStatus.textContent = 'فعال';
			dashboardUserStatus.style.color = '#00ff88';
		}
	}
	
	// به‌روزرسانی در شبکه
	const networkIndexEl = document.getElementById('network-user-index');
	if (networkIndexEl) {
		networkIndexEl.textContent = cpaId;
	}
	
	// نمایش در گوشه
	window.displayCPAIdInCorner(index);
};

// پیام‌های خطا و راهنمایی برای اتصال متامسک
const META_MASK_MESSAGES = {
	// پیام‌های اتصال
	CONNECTION: {
		NOT_DETECTED: "متامسک یافت نشد! لطفاً متامسک را نصب کنید و دوباره تلاش کنید.",
		NOT_CONNECTED: "متامسک متصل نیست. لطفاً ابتدا کیف پول خود را متصل کنید.",
		CONNECTION_FAILED: "خطا در اتصال به متامسک. لطفاً دوباره تلاش کنید.",
		NETWORK_ERROR: "شبکه اشتباه است. لطفاً به شبکه Polygon تغییر دهید.",
		ACCOUNT_CHANGED: "حساب کاربری تغییر کرده است. لطفاً دوباره وارد شوید.",
		REQUEST_PENDING: "درخواست اتصال در حال پردازش است...",
		ALREADY_CONNECTING: "در حال اتصال... لطفاً صبر کنید."
	},
	
	// پیام‌های ثبت‌نام و فعال‌سازی
	REGISTRATION: {
		NOT_REGISTERED: "شما ثبت‌نام نشده‌اید. ابتدا باید ثبت‌نام کنید.",
		ALREADY_REGISTERED: "شما قبلاً ثبت‌نام کرده‌اید.",
		INSUFFICIENT_BALANCE: "موجودی توکن شما برای ثبت‌نام کافی نیست.",
		INVALID_REFERRER: "معرف نامعتبر است. لطفاً آدرس معرف صحیح را وارد کنید.",
		REFERRER_NOT_ACTIVE: "معرف شما فعال نیست.",
		REGISTRATION_SUCCESS: "ثبت‌نام با موفقیت انجام شد!",
		ACTIVATION_SUCCESS: "حساب شما با موفقیت فعال شد!"
	},
	
	// پیام‌های خرید و فروش توکن
	TRADING: {
		MIN_BUY_AMOUNT: "حداقل مبلغ خرید 1 DAI است.",
		MIN_SELL_AMOUNT: "حداقل مبلغ فروش 1 توکن است.",
		INSUFFICIENT_TOKEN_BALANCE: "موجودی توکن شما کافی نیست.",
		INSUFFICIENT_DAI_BALANCE: "موجودی DAI شما کافی نیست.",
		EXCEEDS_BUY_LIMIT: "مبلغ خرید از حد مجاز بیشتر است.",
		EXCEEDS_SELL_LIMIT: "مبلغ فروش از حد مجاز بیشتر است (حداکثر 50% موجودی).",
		FIRST_BUY_MINIMUM: "برای اولین خرید حداقل 500 DAI نیاز است.",
		CONTRACT_EMPTY: "موجودی قرارداد صفر است. حداقل خرید 1000 DAI است.",
		BUY_SUCCESS: "خرید با موفقیت انجام شد!",
		SELL_SUCCESS: "فروش با موفقیت انجام شد!",
		PRICE_CALCULATION_ERROR: "خطا در محاسبه قیمت توکن."
	},
	
	// پیام‌های پاداش و ادعا
	REWARDS: {
		NO_POINTS_TO_CLAIM: "نقطه‌ای برای ادعا ندارید.",
		NO_GLOBAL_POINTS: "نقطه‌ای در سیستم موجود نیست.",
		COOLDOWN_NOT_FINISHED: "زمان انتظار هنوز تمام نشده است (12 ساعت).",
		REWARD_TOO_LOW: "مقدار پاداش خیلی کم است.",
		CLAIM_SUCCESS: "پاداش با موفقیت دریافت شد!",
		MONTHLY_REWARD_NOT_ELIGIBLE: "شما واجد شرایط دریافت پاداش ماهانه نیستید.",
		MONTHLY_REWARD_WAIT: "هنوز زمان دریافت پاداش ماهانه نرسیده است (30 روز).",
		MAX_CASHBACK_REACHED: "حداکثر مقدار کاش‌بک دریافت شده است.",
		NO_CASHBACK_AVAILABLE: "کاش‌بک موجود نیست.",
		MONTHLY_REWARD_SUCCESS: "پاداش ماهانه با موفقیت دریافت شد!"
	},
	
	// پیام‌های شبکه و درخت
	NETWORK: {
		USER_NOT_FOUND: "کاربر یافت نشد.",
		TREE_LOADING: "در حال بارگذاری درخت شبکه...",
		TREE_ERROR: "خطا در بارگذاری درخت شبکه.",
		NETWORK_STATS_LOADING: "در حال بارگذاری آمار شبکه...",
		NETWORK_STATS_ERROR: "خطا در بارگذاری آمار شبکه."
	},
	
	// پیام‌های عمومی
	GENERAL: {
		TRANSACTION_PENDING: "تراکنش در حال پردازش است...",
		TRANSACTION_SUCCESS: "تراکنش با موفقیت انجام شد!",
		TRANSACTION_FAILED: "تراکنش ناموفق بود. لطفاً دوباره تلاش کنید.",
		NETWORK_ERROR: "خطا در شبکه. لطفاً اتصال خود را بررسی کنید.",
		CONTRACT_ERROR: "خطا در قرارداد هوشمند.",
		GAS_ERROR: "خطا در پرداخت گاز. موجودی شما کافی نیست.",
		USER_REJECTED: "کاربر تراکنش را لغو کرد.",
		UNKNOWN_ERROR: "خطای ناشناخته رخ داد. لطفاً دوباره تلاش کنید."
	},
	
	// پیام‌های راهنمایی
	HELP: {
		CONNECT_WALLET: "برای استفاده از امکانات سایت، ابتدا کیف پول خود را متصل کنید.",
		SWITCH_NETWORK: "لطفاً شبکه خود را به Polygon تغییر دهید.",
		INSTALL_METAMASK: "متامسک نصب نیست. لطفاً از Chrome Web Store نصب کنید.",
		APPROVE_TRANSACTION: "لطفاً تراکنش را در متامسک تأیید کنید.",
		CHECK_BALANCE: "موجودی خود را بررسی کنید.",
		WAIT_CONFIRMATION: "لطفاً منتظر تأیید تراکنش باشید."
	}
};

// تابع نمایش پیام‌های خطا
function showErrorMessage(category, messageKey, customMessage = null) {
	const message = customMessage || META_MASK_MESSAGES[category]?.[messageKey] || META_MASK_MESSAGES.GENERAL.UNKNOWN_ERROR;
	
	// نمایش پیام در UI
	if (typeof showNotification === 'function') {
		showNotification(message, 'error');
	} else {
		alert(message);
	}
	
	console.error(`[${category}] ${messageKey}:`, message);
}

// تابع نمایش پیام‌های موفقیت
function showSuccessMessage(category, messageKey, customMessage = null) {
	const message = customMessage || META_MASK_MESSAGES[category]?.[messageKey] || 'عملیات با موفقیت انجام شد!';
	
	// نمایش پیام در UI
	if (typeof showNotification === 'function') {
		showNotification(message, 'success');
	} else {
		alert(message);
	}
	
	console.log(`[${category}] ${messageKey}:`, message);
}

// تابع نمایش پیام‌های راهنمایی
function showHelpMessage(category, messageKey, customMessage = null) {
	const message = customMessage || META_MASK_MESSAGES.HELP[messageKey] || 'لطفاً راهنمای سایت را مطالعه کنید.';
	
	// نمایش پیام در UI
	if (typeof showNotification === 'function') {
		showNotification(message, 'info');
	} else {
		alert(message);
	}
	
	console.info(`[HELP] ${messageKey}:`, message);
}

// تابع بررسی وضعیت اتصال
function checkConnectionStatus() {
	if (typeof window.ethereum === 'undefined') {
		showErrorMessage('CONNECTION', 'NOT_DETECTED');
		showHelpMessage('HELP', 'INSTALL_METAMASK');
		return false;
	}
	
	if (!window.ethereum.isConnected()) {
		showErrorMessage('CONNECTION', 'NOT_CONNECTED');
		showHelpMessage('HELP', 'CONNECT_WALLET');
		return false;
	}
	
	return true;
}

// تابع بررسی شبکه
function checkNetwork() {
	if (typeof window.ethereum === 'undefined') {
		return false;
	}
	
	// بررسی شبکه Polygon (Chain ID: 137)
	if (window.ethereum.chainId !== '0x89') {
		showErrorMessage('CONNECTION', 'NETWORK_ERROR');
		showHelpMessage('HELP', 'SWITCH_NETWORK');
		return false;
	}
	
	return true;
}

// تابع مدیریت خطاهای قرارداد
function handleContractError(error) {
	const errorMessage = error.message || error.toString();
	
	if (errorMessage.includes('not registered')) {
		showErrorMessage('REGISTRATION', 'NOT_REGISTERED');
	} else if (errorMessage.includes('Already registered')) {
		showErrorMessage('REGISTRATION', 'ALREADY_REGISTERED');
	} else if (errorMessage.includes('Insufficient token balance')) {
		showErrorMessage('TRADING', 'INSUFFICIENT_TOKEN_BALANCE');
	} else if (errorMessage.includes('Minimum 1 DAI required')) {
		showErrorMessage('TRADING', 'MIN_BUY_AMOUNT');
	} else if (errorMessage.includes('Minimum 1 token required')) {
		showErrorMessage('TRADING', 'MIN_SELL_AMOUNT');
	} else if (errorMessage.includes('Amount exceeds buy limit')) {
		showErrorMessage('TRADING', 'EXCEEDS_BUY_LIMIT');
	} else if (errorMessage.includes('Amount exceeds sell limit')) {
		showErrorMessage('TRADING', 'EXCEEDS_SELL_LIMIT');
	} else if (errorMessage.includes('No points to claim')) {
		showErrorMessage('REWARDS', 'NO_POINTS_TO_CLAIM');
	} else if (errorMessage.includes('Cooldown not finished')) {
		showErrorMessage('REWARDS', 'COOLDOWN_NOT_FINISHED');
	} else if (errorMessage.includes('User rejected')) {
		showErrorMessage('GENERAL', 'USER_REJECTED');
	} else if (errorMessage.includes('gas')) {
		showErrorMessage('GENERAL', 'GAS_ERROR');
	} else {
		showErrorMessage('GENERAL', 'CONTRACT_ERROR', errorMessage);
	}
}

// تابع ثبت‌نام کاربر جدید با معرف
window.registerNewUserWithReferrer = async function(referrerAddress, newUserAddress, statusElement) {
	try {
		// بررسی اتصال کیف پول
		const { contract, address } = await window.connectWallet();
		if (!contract || !address) {
			if (statusElement) statusElement.textContent = 'اتصال کیف پول در دسترس نیست';
			showErrorMessage('CONNECTION', 'NOT_CONNECTED');
			return false;
		}

		// بررسی موجودی توکن
		const userBalance = await contract.balanceOf(address);
		
		// دریافت قیمت ثبت‌نام - بررسی اینکه آیا تابع وجود دارد
		let regPrice;
		try {
			if (typeof contract.getRegPrice === 'function') {
				regPrice = await contract.getRegPrice();
			} else if (typeof contract.regPrice === 'function') {
				regPrice = await contract.regPrice();
			} else {
				if (statusElement) statusElement.textContent = 'قیمت ثبت‌نام قابل دریافت نیست.';
				showErrorMessage('REGISTRATION', 'NO_REG_PRICE');
				return false;
			}
		} catch (e) {
			if (statusElement) statusElement.textContent = 'قیمت ثبت‌نام قابل دریافت نیست.';
			showErrorMessage('REGISTRATION', 'NO_REG_PRICE');
			return false;
		}
		
		if (userBalance < regPrice) {
			if (statusElement) statusElement.textContent = 'موجودی توکن شما برای ثبت‌نام کافی نیست';
			showErrorMessage('REGISTRATION', 'INSUFFICIENT_BALANCE');
			return false;
		}

		// نمایش وضعیت
		if (statusElement) {
			statusElement.style.color = '#00ff88';
			statusElement.textContent = 'در حال ثبت‌نام... لطفاً صبر کنید';
		}

		// فراخوانی تابع ثبت‌نام قرارداد
		const tx = await contract.registerAndActivate(referrerAddress, newUserAddress, { gasLimit: 500000 });
		
		// انتظار برای تأیید تراکنش
		if (statusElement) {
			statusElement.textContent = 'تراکنش در حال پردازش...';
		}
		
		const receipt = await tx.wait();
		
		if (receipt.status === 1) {
			if (statusElement) {
				statusElement.style.color = '#00ff88';
				statusElement.textContent = 'ثبت‌نام با موفقیت انجام شد!';
			}
			showSuccessMessage('REGISTRATION', 'REGISTRATION_SUCCESS');
			return true;
		} else {
			if (statusElement) {
				statusElement.style.color = '#ff4444';
				statusElement.textContent = 'تراکنش ناموفق بود';
			}
			showErrorMessage('GENERAL', 'TRANSACTION_FAILED');
			return false;
		}

	} catch (error) {
		console.error('Error registering new user:', error);
		
		if (statusElement) {
			statusElement.style.color = '#ff4444';
			statusElement.textContent = `خطا: ${error.message}`;
		}
		
		handleContractError(error);
		return false;
	}
};


// تابع مرکزی برای گرفتن همه گزارشات
window.getAllReports = async function(address) {
  // اگر تابع fetchReports وجود دارد، از آن استفاده کن
  if (typeof window.fetchReports === 'function') {
	return await window.fetchReports(address);
  }
  // اگر تابع واقعی وجود ندارد، پیام خطا برگردان
  return [];
};
// ... existing code ...

var searchIndexBtn = document.getElementById('search-index-btn');
if (searchIndexBtn) {
  searchIndexBtn.onclick = async function() {
	const index = document.getElementById('index').value.trim();
	// ...
	const refAddr = await contract.indexToAddress(index);
	document.getElementById('referrer-address').value = refAddr;
	// ...
  };
}

// مقداردهی سراسری برای استفاده در products-manager.js و سایر بخش‌ها
window.tokenAddress = CPA_ADDRESS;
window.tokenAbi = CPA_ABI;

// ... existing code ...
window.DAI_ADDRESS = DAI_ADDRESS;
window.DAI_ABI = DAI_ABI;
window.CPA_ADDRESS = CPA_ADDRESS;
window.CONTRACT_ABI = CPA_ABI;
