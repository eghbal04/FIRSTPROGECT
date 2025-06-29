// تنظیمات قرارداد LevelUp
const CONTRACT_ADDRESS = '0x4aE0A254a3c78442568b74B6CC7e61d13BdC6Df8';
const LEVELUP_ABI = [
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
				"name": "amountlvl",
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newTokenPrice",
				"type": "uint256"
			}
		],
		"name": "DirectMATICReceived",
		"type": "event"
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
				"name": "maticAmount",
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
				"name": "maticAmount",
				"type": "uint256"
			}
		],
		"name": "TokensSold",
		"type": "event"
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
				"name": "amountlvl",
				"type": "uint256"
			}
		],
		"name": "purchaseKind",
		"type": "event"
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
		"name": "binaryPool",
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
		"name": "buyTokens",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "circulatingSupply",
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
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "claimable",
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
		"name": "countSubtreeUsers",
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "eligibleForReward",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "maticAmount",
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
		"name": "getContractMaticBalance",
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
				"name": "tokenAddress",
				"type": "address"
			}
		],
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
		"name": "getLatestLvlPrice",
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
		"name": "getLatestMaticPrice",
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
		"inputs": [],
		"name": "getPrice",
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
		"name": "getRegistrationPrice",
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
		"name": "getTokenPriceInUSD",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isClaimable",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
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
		"name": "isSlotLocked",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "oracles",
		"outputs": [
			{
				"internalType": "contract AggregatorV3Interface",
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
		"name": "points",
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
				"name": "amountLvl",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
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
				"name": "",
				"type": "address"
			}
		],
		"name": "registered",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "regprice",
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
		"name": "rewardPool",
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
		"name": "sellTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "subtreeCount",
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
		"name": "totalDirectDeposits",
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
		"name": "totalPoints",
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
		"name": "totalUsers",
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
		"inputs": [],
		"name": "updateTokenPrice",
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
				"name": "usdAmountInCents",
				"type": "uint256"
			}
		],
		"name": "usdToMatic",
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
				"name": "leftChild",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rightChild",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "parent",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
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
				"name": "totalPurchasedMATIC",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalPurchasedKind",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastClaimTime",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
];

// مدیریت درخواست‌های همزمان
let isInitializing = false;
let initializationPromise = null;
let permissionRequestInProgress = false;

async function performWeb3Initialization() {
    try {
        console.log('Starting Web3 initialization...');
        
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not detected');
        }
        
        // بررسی شبکه Polygon
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x89') {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x89' }]
                });
                console.log('Successfully switched to Polygon network');
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x89',
                            chainName: 'Polygon',
                            nativeCurrency: {
                                name: 'POL',
                                symbol: 'POL',
                                decimals: 18
                            },
                            rpcUrls: ['https://polygon-rpc.com/'],
                            blockExplorerUrls: ['https://polygonscan.com/']
                        }]
                    });
                } else {
                    throw switchError;
                }
            }
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log('Browser provider created successfully');
        
        let signer;
        
        // بررسی وضعیت اتصال فعلی
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
            console.log('Accounts already connected:', accounts);
            signer = await provider.getSigner();
            console.log('Signer obtained from existing connection');
        } else {
            console.log('No accounts connected, requesting permission...');
            
            // جلوگیری از درخواست‌های همزمان
            if (permissionRequestInProgress) {
                console.log('Permission request already in progress, waiting...');
                await new Promise(resolve => {
                    const checkInterval = setInterval(async () => {
                        if (!permissionRequestInProgress) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 500);
                    
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve();
                    }, 30000);
                });
                
                // تلاش مجدد برای دریافت signer
                const retryAccounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (retryAccounts && retryAccounts.length > 0) {
                    signer = await provider.getSigner();
                    console.log('Signer obtained after waiting');
                } else {
                    throw new Error('User did not approve connection');
                }
            } else {
                permissionRequestInProgress = true;
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    signer = await provider.getSigner();
                    console.log('Signer obtained after permission request');
                } catch (permissionError) {
                    console.log('Permission request failed:', permissionError);
                    
                    if (permissionError.code === -32002) {
                        console.log('Permission request pending, waiting for user action...');
                        
                        await new Promise(resolve => {
                            const checkInterval = setInterval(async () => {
                                try {
                                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                                    if (accounts && accounts.length > 0) {
                                        clearInterval(checkInterval);
                                        resolve();
                                    }
                                } catch (error) {
                                    // ادامه انتظار
                                }
                            }, 1000);
                            
                            setTimeout(() => {
                                clearInterval(checkInterval);
                                resolve();
                            }, 30000);
                        });
                        
                        // تلاش مجدد
                        const retryAccounts = await window.ethereum.request({ method: 'eth_accounts' });
                        if (retryAccounts && retryAccounts.length > 0) {
                            signer = await provider.getSigner();
                            console.log('Signer obtained after user approval');
                        } else {
                            throw new Error('User did not approve connection');
                        }
                    } else {
                        throw permissionError;
                    }
                } finally {
                    permissionRequestInProgress = false;
                }
            }
        }
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, LEVELUP_ABI, signer);
        console.log('Contract created successfully');
        
        const address = await signer.getAddress();
        console.log('Wallet address obtained:', address);
        
        const network = await provider.getNetwork();
        console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
        
        window.contractConfig = {
            ...window.contractConfig,
            provider: provider,
            signer: signer,
            contract: contract,
            address: address,
            initializeWeb3: initializeWeb3
        };
        
        console.log('Web3 initialized successfully');
        return window.contractConfig;
        
    } catch (error) {
        console.error('خطا در راه‌اندازی Web3:', error);
        
        if (window.contractConfig) {
            window.contractConfig.provider = null;
            window.contractConfig.signer = null;
            window.contractConfig.contract = null;
            window.contractConfig.address = null;
        }
        
        throw error;
    }
}

async function initializeWeb3() {
    if (isInitializing) {
        console.log('Web3 initialization already in progress, waiting...');
        return initializationPromise;
    }
    
    if (window.contractConfig && 
        window.contractConfig.provider && 
        window.contractConfig.signer && 
        window.contractConfig.contract) {
        console.log('Web3 already initialized');
        return window.contractConfig;
    }
    
    isInitializing = true;
    initializationPromise = performWeb3Initialization();
    
    try {
        const result = await initializationPromise;
        return result;
    } finally {
        isInitializing = false;
        initializationPromise = null;
    }
}

// تنظیمات قرارداد
window.contractConfig = {
    CONTRACT_ADDRESS: CONTRACT_ADDRESS,
    LEVELUP_ABI: LEVELUP_ABI,
    provider: null,
    signer: null,
    contract: null,
    address: null,
    initializeWeb3: initializeWeb3
};

// ===== توابع مرکزی برای استفاده در همه فایل‌ها =====

// تابع مرکزی اتصال کیف پول
window.connectWallet = async function() {
    try {
        console.log('Central: Attempting to connect wallet...');
        
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address && window.contractConfig.signer) {
            console.log('Central: Wallet already connected');
            return {
                contract: window.contractConfig.contract,
                address: window.contractConfig.address,
                signer: window.contractConfig.signer,
                provider: window.contractConfig.provider
            };
        }
        
        // راه‌اندازی Web3
        await window.contractConfig.initializeWeb3();
        
        if (window.contractConfig && window.contractConfig.contract) {
            console.log('Central: Wallet connected successfully');
            return {
                contract: window.contractConfig.contract,
                address: window.contractConfig.address,
                signer: window.contractConfig.signer,
                provider: window.contractConfig.provider
            };
        }
        
        throw new Error('خطا در اتصال به کیف پول');
        
    } catch (error) {
        console.error('Central: Error connecting wallet:', error);
        throw error;
    }
};

// تابع مرکزی دریافت پروفایل کاربر
window.getUserProfile = async function() {
    try {
        const { contract, address, provider, signer } = await window.connectWallet();
        
        if (!address) {
            throw new Error('No wallet address available');
        }
        
        console.log('Profile: Fetching user data for address:', address);
        
        // دریافت اطلاعات کاربر با مدیریت خطا
        let user;
        try {
            user = await contract.users(address);
            console.log('Profile: User data received:', user);
        } catch (error) {
            console.error('Profile: Error fetching user data:', error);
            // اگر کاربر ثبت‌نام نشده باشد، اطلاعات پیش‌فرض برگردان
            return {
                address: address,
                referrer: null,
                activated: false,
                binaryPoints: "0",
                binaryPointCap: 0,
                totalPurchasedMATIC: "0",
                totalPurchasedKind: "0",
                polBalance: "0",
                maticBalance: "0",
                lvlBalance: "0",
                polValueUSD: "0",
                lvlValueUSD: "0",
                registered: false,
                index: "0"
            };
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
                balanceProvider.getBalance(address),
                contract.balanceOf(address)
            ]);
            console.log('Profile: Balances received - POL:', polBalance.toString(), 'LVL:', lvlBalance.toString());
        } catch (error) {
            console.error('Profile: Error fetching balances:', error);
        }
        
        // دریافت قیمت‌ها برای محاسبه ارزش دلاری
        let lvlPriceUSD = 0n;
        let polPrice = 0n;
        
        try {
            [lvlPriceUSD, polPrice] = await Promise.all([
                contract.getTokenPriceInUSD(),
                contract.getLatestMaticPrice()
            ]);
            console.log('Profile: Prices received - LVL USD:', lvlPriceUSD.toString(), 'POL USD:', polPrice.toString());
        } catch (error) {
            console.error('Profile: Error fetching prices:', error);
        }
        
        // محاسبه ارزش دلاری (همه مقادیر BigInt هستند)
        let lvlValueUSD = 0n;
        let polValueUSD = 0n;
        try {
            if (lvlBalance && lvlPriceUSD && lvlBalance > 0n && lvlPriceUSD > 0n) {
                lvlValueUSD = (lvlBalance * lvlPriceUSD) / (10n ** 18n);
            }
            if (polBalance && polPrice && polBalance > 0n && polPrice > 0n) {
                polValueUSD = (polBalance * polPrice) / (10n ** 18n);
            }
        } catch (e) {
            console.error('Profile: Error calculating USD values:', e);
            lvlValueUSD = 0n;
            polValueUSD = 0n;
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

        const profile = {
            address: address,
            referrer: user.referrer || null,
            activated: user.activated || false,
            binaryPoints: user.binaryPoints ? user.binaryPoints.toString() : '0',
            binaryPointCap: user.binaryPointCap ? user.binaryPointCap.toString() : '0',
            totalPurchasedMATIC: ethers.formatEther(user.totalPurchasedMATIC || 0n),
            totalPurchasedKind: user.totalPurchasedKind ? user.totalPurchasedKind.toString() : '0',
            polBalance: ethers.formatEther(polBalance || 0n),
            maticBalance: ethers.formatEther(polBalance || 0n),
            lvlBalance: ethers.formatUnits(lvlBalance || 0n, 18),
            polValueUSD: safeFormat(polValueUSD, 8),
            lvlValueUSD: safeFormat(lvlValueUSD, 8),
            registered: user.activated || false,
            index: user.index ? user.index.toString() : '0'
        };

        console.log('Profile: Final profile data:', profile);
        return profile;
        
    } catch (error) {
        console.error('Central: Error fetching user profile:', error);
        return {
            address: null,
            referrer: null,
            activated: false,
            binaryPoints: "0",
            binaryPointCap: 0,
            totalPurchasedMATIC: "0",
            totalPurchasedKind: "0",
            polBalance: "0",
            maticBalance: "0",
            lvlBalance: "0",
            polValueUSD: "0",
            lvlValueUSD: "0",
            registered: false,
            index: "0"
        };
    }
};

// تابع مرکزی دریافت قیمت‌ها
window.getPrices = async function() {
    try {
        const { contract } = await window.connectWallet();
        
        // دریافت قیمت‌ها به صورت موازی
        const [lvlPriceUSD, lvlPricePol, polPrice] = await Promise.all([
            contract.getTokenPriceInUSD().catch(() => ethers.parseUnits("0.0012", 8)),
            contract.updateTokenPrice().catch(() => ethers.parseUnits("0.0012", 18)),
            contract.getLatestMaticPrice().catch(() => ethers.parseUnits("1.00", 8))
        ]);
        
        return {
            lvlPriceUSD: ethers.formatUnits(lvlPriceUSD, 8),
            lvlPricePol: ethers.formatUnits(lvlPricePol, 18),
            polPrice: ethers.formatUnits(polPrice, 8)
        };
    } catch (error) {
        console.error('Central: Error fetching prices:', error);
        return {
            lvlPriceUSD: "0.0012",
            lvlPricePol: "0.0012",
            polPrice: "1.00"
        };
    }
};

// تابع مرکزی دریافت آمار قرارداد
window.getContractStats = async function() {
    try {
        const { contract } = await window.connectWallet();
        
        // دریافت آمار به صورت موازی
        const [
            totalUsers, totalSupply, binaryPool, 
            rewardPool, totalPoints, totalClaimableBinaryPoints, pointValue
        ] = await Promise.all([
            contract.totalUsers().catch(() => 0n),
            contract.totalSupply().catch(() => 0n),
            contract.binaryPool().catch(() => 0n),
            contract.rewardPool().catch(() => 0n),
            contract.totalPoints().catch(() => 0n),
            contract.totalClaimableBinaryPoints().catch(() => 0n),
            contract.getPointValue().catch(() => 0n)
        ]);
        
        // محاسبه circulatingSupply به صورت تقریبی
        // circulatingSupply = totalSupply - tokens in contract
        let circulatingSupply = totalSupply;
        try {
            const contractBalance = await contract.balanceOf(contract.target);
            circulatingSupply = totalSupply - contractBalance;
        } catch (e) {
            console.warn('Could not calculate circulating supply, using total supply:', e);
            circulatingSupply = totalSupply;
        }
        
        return {
            totalUsers: totalUsers.toString(),
            totalSupply: ethers.formatUnits(totalSupply, 18),
            circulatingSupply: ethers.formatUnits(circulatingSupply, 18),
            binaryPool: ethers.formatEther(binaryPool),
            rewardPool: ethers.formatEther(rewardPool),
            totalPoints: ethers.formatUnits(totalPoints, 18),
            totalClaimableBinaryPoints: ethers.formatUnits(totalClaimableBinaryPoints, 18),
            pointValue: ethers.formatUnits(pointValue, 18)
        };
    } catch (error) {
        console.error('Central: Error fetching contract stats:', error);
        return {
            totalUsers: "0",
            totalSupply: "0",
            circulatingSupply: "0",
            binaryPool: "0",
            rewardPool: "0",
            totalPoints: "0",
            totalClaimableBinaryPoints: "0",
            pointValue: "0"
        };
    }
};

// تابع مرکزی بررسی اتصال
window.checkConnection = async function() {
    try {
        const { provider, address } = await window.connectWallet();
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
};

// تابع debug برای تست circulatingSupply
window.debugCirculatingSupply = async function() {
    try {
        const { contract } = await window.connectWallet();
        
        console.log('Debug: Testing circulating supply...');
        
        // تست مستقیم circulatingSupply
        try {
            const directCirculatingSupply = await contract.circulatingSupply();
            console.log('Debug: Direct circulatingSupply:', directCirculatingSupply.toString());
        } catch (e) {
            console.log('Debug: Direct circulatingSupply failed:', e.message);
        }
        
        // تست totalSupply
        try {
            const totalSupply = await contract.totalSupply();
            console.log('Debug: Total supply:', totalSupply.toString());
        } catch (e) {
            console.log('Debug: Total supply failed:', e.message);
        }
        
        // تست contract balance
        try {
            const contractBalance = await contract.balanceOf(contract.target);
            console.log('Debug: Contract balance:', contractBalance.toString());
        } catch (e) {
            console.log('Debug: Contract balance failed:', e.message);
        }
        
        // تست deployer balance
        try {
            const deployer = await contract.deployer();
            const deployerBalance = await contract.balanceOf(deployer);
            console.log('Debug: Deployer balance:', deployerBalance.toString());
        } catch (e) {
            console.log('Debug: Deployer balance failed:', e.message);
        }
        
    } catch (error) {
        console.error('Debug: Error testing circulating supply:', error);
    }
};

// تابع debug برای تست موجودی POL قرارداد
window.debugContractPolBalance = async function() {
    try {
        const { contract, provider } = await window.connectWallet();
        
        console.log('Debug: Testing contract POL balance...');
        console.log('Debug: Contract address:', contract.target);
        
        // تست موجودی POL قرارداد
        try {
            const polBalance = await provider.getBalance(contract.target);
            console.log('Debug: Contract POL balance (wei):', polBalance.toString());
            console.log('Debug: Contract POL balance (POL):', ethers.formatEther(polBalance));
        } catch (e) {
            console.log('Debug: Contract POL balance failed:', e.message);
        }
        
        // تست تابع getContractMaticBalance از قرارداد
        try {
            const contractPolBalance = await contract.getContractMaticBalance();
            console.log('Debug: Contract getContractMaticBalance (wei):', contractPolBalance.toString());
            console.log('Debug: Contract getContractMaticBalance (POL):', ethers.formatEther(contractPolBalance));
        } catch (e) {
            console.log('Debug: getContractMaticBalance failed:', e.message);
        }
        
    } catch (error) {
        console.error('Debug: Error testing contract POL balance:', error);
    }
};

console.log('Central Web3 functions loaded successfully');
