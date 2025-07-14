const CONTRACT_LOTARY = '0x0000000000000000000000000000000000000000';
const deepseek_api ='sk-6074908ce7954bd89d494d57651392a8';


// تنظیمات قرارداد LevelUp
const CONTRACT_ADDRESS = '0x892b475E96B5C437c5B8E880f1836Bb3E45823dB';
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // Polygon USDC
const USDC_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "success", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "success", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_from", "type": "address" },
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "name": "success", "type": "bool" }],
    "type": "function"
  }
];
const LEVELUP_ABI =[
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
				"name": "usdcAmount",
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
				"name": "usdcAmount",
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
				"name": "usdcAmount",
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
				"name": "usdcAmount",
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
		"name": "getContractUSDCBalance",
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
		"name": "usdcToken",
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

// Add request deduplication for eth_requestAccounts
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
        
        const provider = new ethers.BrowserProvider(window.ethereum, {
            name: 'Polygon',
            chainId: 137
        });
        
        // تنظیم timeout و retry برای provider - فقط اگر connection موجود باشد
        if (provider.connection) {
            provider.connection.timeout = 30000; // 30 ثانیه timeout
        }
        
        let signer;
        
        // بررسی وضعیت اتصال فعلی
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
            signer = await provider.getSigner();
        } else {
            // Use deduplicated request for eth_requestAccounts
            try {
                await requestAccountsWithDeduplication();
                signer = await provider.getSigner();
            } catch (permissionError) {
                if (permissionError.code === -32002) {
                    // Wait for user to approve in another tab/window
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
                        }, 2000); // افزایش فاصله زمانی
                        
                        setTimeout(() => {
                            clearInterval(checkInterval);
                            resolve();
                        }, 15000); // کاهش زمان انتظار
                    });
                    
                    // تلاش مجدد
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
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, LEVELUP_ABI, signer);
        
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
    CONTRACT_ADDRESS: CONTRACT_ADDRESS,
    LEVELUP_ABI: LEVELUP_ABI,
    provider: null,
    signer: null,
    contract: null,
    address: null,
    initializeWeb3: initializeWeb3
};

// ===== توابع مرکزی برای استفاده در همه فایل‌ها =====

// Add debounce mechanism for wallet operations
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
                
                // If this is not the last attempt, wait before retrying
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
                }
            }
        }
        
        throw lastError;
    });
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
    window.ethereum.on('accountsChanged', function (accounts) {
        console.log('MetaMask accounts changed:', accounts);
        window.clearConnectionCache();
    });
    
    // پاک کردن کش هنگام تغییر شبکه
    window.ethereum.on('chainChanged', function (chainId) {
        console.log('MetaMask chain changed:', chainId);
        window.clearConnectionCache();
    });
    
    // پاک کردن کش هنگام قطع اتصال
    window.ethereum.on('disconnect', function (error) {
        console.log('MetaMask disconnected:', error);
        window.clearConnectionCache();
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
        
        // تنظیم interval برای بارگذاری مجدد هر 5 دقیقه
        if (!window.networkStatsInterval) {
            window.networkStatsInterval = setInterval(async () => {
                if (!document.hidden) {
                    try {
                        const conn = await window.connectWallet();
                        if (conn && conn.contract) {
                            await loadNetworkStats(conn.contract);
                        }
                    } catch (error) {
                        console.warn('Auto-load network stats error:', error);
                    }
                }
            }, 5 * 60 * 1000); // 5 دقیقه
        }
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
                user = await contract.users(address);
            } catch (error) {
                console.error('Profile: Error fetching user data:', error);
                throw new Error('User data not available');
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
                throw new Error('Balance data not available');
            }
            
            // دریافت قیمت‌ها برای محاسبه ارزش دلاری
            let lvlPriceMatic = 0n;
            let polPriceUSD = 0;
            try {
                lvlPriceMatic = await contract.getTokenPrice();
            } catch (error) {
                console.error('Profile: Error fetching prices:', error);
                throw new Error('Price data not available');
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
            
            // دریافت موجودی USDC
            let usdcBalance = '0';
            try {
                const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
                const usdcRaw = await usdcContract.balanceOf(address);
                usdcBalance = (Number(usdcRaw) / 1e6).toFixed(2);
            } catch (e) {
                usdcBalance = '0';
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
                usdcBalance: usdcBalance,
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

// تابع دریافت قیمت USDC - همیشه 1 دلار
window.fetchPolUsdPrice = async function() {
    return 1.0; // USDC همیشه 1 دلار است
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
        console.log(`${index + 1}. ${entry.price} USDC - ${date}`);
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
        console.log(`🪙 Latest Token Price: ${lastToken.price} USDC`);
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

// --- Lottery Config ---
window.LOTTERY_CONFIG = {
  tokenAddress: CONTRACT_ADDRESS,
  lotteryAddress: CONTRACT_LOTARY,
  tokenAbi: LEVELUP_ABI,
  ticketPrice: 1,
  maxTicketsPerUser: 5
};

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
                // Wait longer before retry
                await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
                continue;
            }
            
            if (i === maxRetries - 1) {
                // Last attempt, throw the error
                throw error;
            }
            
            // Default retry delay
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
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

// تابع مرکزی برای دریافت قیمت ثبت‌نام
window.getRegistrationPrice = async function(contract = null) {
    try {
        if (!contract) {
            const connection = await window.connectWallet();
            contract = connection.contract;
        }
        
        // Try to get registration price from contract, fallback to hardcoded value
        let regPrice;
        try {
            // First try getRegPrice (new function)
            if (typeof contract.getRegPrice === 'function') {
                regPrice = await contract.getRegPrice();
                console.log('✅ Using getRegPrice function');
            }
            // Then try regprice (old function name)
            else if (typeof contract.regprice === 'function') {
                regPrice = await contract.regprice();
                console.log('✅ Using regprice function');
            }
            // Then try regPrice (alternative spelling)
            else if (typeof contract.regPrice === 'function') {
                regPrice = await contract.regPrice();
                console.log('✅ Using regPrice function');
            }
            else {
                // Fallback to hardcoded registration price (100 CPA)
                regPrice = ethers.parseUnits('100', 18);
                console.log('⚠️ No registration price function found, using hardcoded value');
            }
        } catch (e) {
            // Fallback to hardcoded registration price (100 CPA)
            regPrice = ethers.parseUnits('100', 18);
            console.log('⚠️ Error calling registration price function, using hardcoded value:', e.message);
        }
        
        console.log('✅ Registration price (raw):', regPrice.toString());
        console.log('✅ Registration price (formatted):', ethers.formatUnits(regPrice, 18) + ' CPA');
        
        return regPrice;
    } catch (error) {
        console.error('Error getting registration price:', error);
        // Return hardcoded value as last resort
        return ethers.parseUnits('100', 18);
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
    const tokenPriceNum = Number(ethers.formatUnits(tokenPrice, 6)); // قیمت با 6 رقم اعشار (USDC)

    const elTotalSupply = document.getElementById('total-supply');
    if (elTotalSupply) elTotalSupply.innerText = totalSupplyNum.toLocaleString('en-US', {maximumFractionDigits: 4}) + ' CPA';
    const elContractBalance = document.getElementById('contract-balance');
    if (elContractBalance) elContractBalance.innerText = contractBalanceNum.toLocaleString('en-US', {maximumFractionDigits: 4}) + ' CPA';
    document.getElementById('supply-diff').innerText = (totalSupplyNum - contractBalanceNum).toLocaleString('en-US', {maximumFractionDigits: 4}) + ' CPA';
    document.getElementById('total-supply-value').innerText = (totalSupplyNum * tokenPriceNum).toLocaleString('en-US', {maximumFractionDigits: 2}) + ' USDC';
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
    console.log('⏳ Dashboard update already in progress, skipping...');
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

    // Helper function to safely update element
    const safeUpdate = (id, value) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerText = value;
        console.log(`✅ Updated ${id}: ${value}`);
      } else {
        console.warn(`⚠️ Element with id '${id}' not found`);
      }
    };

    // Update blockchain information cards
    

    // Show loading state
    const loadingElements = ['circulating-supply', 'total-points', 'contract-token-balance', 'dashboard-cashback-value', 'dashboard-usdc-balance', 'dashboard-wallets-count', 'dashboard-registration-price'];
    loadingElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerText = 'Loading...';
    });

    // TOTAL SUPPLY (circulating supply)
    try {
      console.log('📊 Fetching total supply...');
      
      // Add timeout protection
      const totalSupplyPromise = contract.totalSupply();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Total supply fetch timeout')), 10000)
      );
      
      const totalSupply = await Promise.race([totalSupplyPromise, timeoutPromise]);
      const formattedSupply = parseFloat(ethers.formatUnits(totalSupply, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
      safeUpdate('circulating-supply', formattedSupply + ' CPA');
      console.log('✅ Total supply updated:', formattedSupply + ' CPA');

    } catch (e) {
      console.error('❌ Error fetching total supply:', e);
      console.error('❌ Error details:', {
        message: e.message,
        code: e.code,
        stack: e.stack
      });
      safeUpdate('circulating-supply', 'Error');
    }

    // TOTAL POINTS
    try {
      console.log('🎯 Fetching total points...');
      const totalPoints = await contract.totalClaimableBinaryPoints();
      const formattedPoints = parseFloat(ethers.formatUnits(totalPoints, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
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
      safeUpdate('contract-token-balance', formattedBalance + ' CPA');
      console.log('✅ Contract token balance updated:', formattedBalance + ' CPA');

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
      safeUpdate('dashboard-cashback-value', formattedCashback + ' CPA');
      console.log('✅ Cashback updated:', formattedCashback + ' CPA');

    } catch (e) {
      console.error('❌ Error fetching cashback:', e);
      safeUpdate('dashboard-cashback-value', 'N/A');
    }

    // USDC CONTRACT BALANCE - Using contract's getContractUSDCBalance function
    try {
      console.log('💵 Fetching USDC contract balance...');
      let usdcBalance;
      
      // Try different possible function names
      if (typeof contract.getContractUSDCBalance === 'function') {
        usdcBalance = await contract.getContractUSDCBalance();
      } else {
        // Fallback to direct USDC contract call
        if (typeof USDC_ADDRESS !== 'undefined' && typeof USDC_ABI !== 'undefined') {
          const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, contract.provider);
          usdcBalance = await usdcContract.balanceOf(contract.target);
        } else {
          usdcBalance = 0n;
        }
      }
      
      const formattedUsdc = parseFloat(ethers.formatUnits(usdcBalance, 6)).toLocaleString('en-US', {maximumFractionDigits: 2});
      safeUpdate('dashboard-usdc-balance', formattedUsdc + ' USDC');
      console.log('✅ USDC contract balance updated:', formattedUsdc + ' USDC');

    } catch (e) {
      console.error('❌ Error fetching USDC balance:', e);
      safeUpdate('dashboard-usdc-balance', 'N/A');
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
      safeUpdate('dashboard-point-value', formattedPointValue + ' CPA');
      console.log('✅ Point value updated:', formattedPointValue + ' CPA');
      
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
      safeUpdate('dashboard-token-price', formattedTokenPrice + ' USDC');
      console.log('✅ Token price updated:', formattedTokenPrice + ' USDC');
      
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
      const registrationPrice = await window.getRegistrationPrice(contract);
      const formattedRegPrice = parseFloat(ethers.formatUnits(registrationPrice, 18)).toLocaleString('en-US', {maximumFractionDigits: 0});
      safeUpdate('dashboard-registration-price', formattedRegPrice + ' CPA');
      console.log('✅ Registration price updated:', formattedRegPrice + ' CPA');
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
    const elements = ['circulating-supply', 'total-points', 'contract-token-balance', 'dashboard-cashback-value', 'dashboard-usdc-balance', 'dashboard-wallets-count', 'dashboard-registration-price'];
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
  setTimeout(async () => {
    try {
      const connection = await window.connectWallet();
      await updateDashboardStats();
    } catch (error) {
      console.error('❌ Error in initial setup:', error);
      // Show error in UI
      const elements = ['circulating-supply', 'total-points', 'contract-token-balance', 'dashboard-cashback-value', 'dashboard-usdc-balance', 'dashboard-wallets-count', 'dashboard-registration-price'];
      elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = 'Connection Error';
      });
    }
  }, 2000);
  
  // Set up interval for blockchain info updates (every 30 seconds)
  if (!window._blockchainInfoIntervalSet) {
    setInterval(async () => {
      try {
        await updateDashboardStats();
      } catch (error) {
        console.error('❌ Error in scheduled update:', error);
      }
    }, 30000); // 30 seconds
    window._blockchainInfoIntervalSet = true;
  }
});





// Example for all assignments:
const elChartLvlUsd = document.getElementById('chart-lvl-usd');
if (elChartLvlUsd) elChartLvlUsd.textContent = '';
const elChartLvlUsdChange = document.getElementById('chart-lvl-usd-change');
if (elChartLvlUsdChange) elChartLvlUsdChange.textContent = '';
const elPriceChartLastUpdate = document.getElementById('price-chart-last-update');
if (elPriceChartLastUpdate) elChartLvlUsdChange.textContent = '';
// ... repeat for all similar assignments ...
// For removed elements, comment out or remove the line:
// const elRemoved = document.getElementById('removed-id');
// if (elRemoved) elRemoved.textContent = '';
// ... existing code ...

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

// Returns the USDC balance of the main contract (CONTRACT_ADDRESS) as a string in USDC units (6 decimals)
async function getContractUSDCBalance() {
  if (typeof ethers === 'undefined') throw new Error('ethers.js not loaded');
  const provider = (window.contractConfig && window.contractConfig.contract && window.contractConfig.contract.provider)
    ? window.contractConfig.contract.provider
    : (window.contractConfig && window.contractConfig.provider)
      ? window.contractConfig.provider
      : (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
  if (!provider) throw new Error('No provider');
  const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  const balanceRaw = await usdcContract.balanceOf(CONTRACT_ADDRESS);
  return ethers.formatUnits(balanceRaw, 6); // returns as string, e.g. '123.456789'
}

// ... existing code ...
// Returns the raw totalClaimableBinaryPoints value (BigInt)
async function getTotalClaimableBinaryPoints() {
  if (typeof ethers === 'undefined') throw new Error('ethers.js not loaded');
  const provider = (window.contractConfig && window.contractConfig.contract && window.contractConfig.contract.provider)
    ? window.contractConfig.contract.provider
    : (window.contractConfig && window.contractConfig.provider)
      ? window.contractConfig.provider
      : (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
  if (!provider) throw new Error('No provider');
  const contract = new ethers.Contract(CONTRACT_ADDRESS, LEVELUP_ABI, provider);
  const pointsRaw = await contract.totalClaimableBinaryPoints();
  return pointsRaw; // BigInt or string
}
// Returns the integer value (no decimals)
async function getTotalClaimableBinaryPointsInteger() {
  const pointsRaw = await getTotalClaimableBinaryPoints();
  return (BigInt(pointsRaw) / 10n ** 18n).toString();
}
// ... existing code ...



// ... existing code ...
// Returns the CPA token balance of the contract using balanceOf(CONTRACT_ADDRESS)
async function getContractTokenBalance() {
  if (typeof ethers === 'undefined') throw new Error('ethers.js not loaded');
  const provider = (window.contractConfig && window.contractConfig.contract && window.contractConfig.contract.provider)
    ? window.contractConfig.contract.provider
    : (window.contractConfig && window.contractConfig.provider)
      ? window.contractConfig.provider
      : (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
  if (!provider) throw new Error('No provider');
  const contract = new ethers.Contract(CONTRACT_ADDRESS, LEVELUP_ABI, provider);
  const tokenRaw = await contract.balanceOf(CONTRACT_ADDRESS);
  return ethers.formatUnits(tokenRaw, 18); // returns as string, e.g. '123.456789012345678901'
}
// ... existing code ...

// Global cache for public contract stats
window.contractStats = {
  totalPoints: null,
  usdcBalance: null,
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
    const contract = new ethers.Contract(CONTRACT_ADDRESS, LEVELUP_ABI, provider);
    // Total Points (integer, no decimals)
    window.contractStats.totalPoints = (await contract.totalClaimableBinaryPoints()).toString();
    // USDC Balance (calls helper)
    window.contractStats.usdcBalance = await getContractUSDCBalance();
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
      if (el2) el2.textContent = pointValueFormatted + ' CPA';
    } catch (error) {
      // ...
    }
  } catch (error) {
    const el = document.getElementById('chart-lvl-usd');
    if (el) el.textContent = 'خطا در بارگذاری';
  }
}


// Set up interval for token price updates
if (!window._dashboardIntervalSet) {
  setInterval(() => {
    updateTokenPriceDisplay();
  }, 30000);
  window._dashboardIntervalSet = true;
}

function unlockHamburgerMenuItems() {
    console.log('>>> unlockHamburgerMenuItems CALLED');
    // ... ادامه کد ...
}

