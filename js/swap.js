// swap.js - Professional and principled for DAI ↔ IAM swap

// Contract addresses for swap page
// Use window variables to avoid redeclaration conflicts with config.js
const IAM_ADDRESS_OLD = (typeof window !== 'undefined' && window.IAM_ADDRESS_OLD) ? window.IAM_ADDRESS_OLD : '0x2D3923A5ba62B2bec13b9181B1E9AE0ea2C8118D'; // Old contract (default)
const IAM_ADDRESS_NEW = (typeof window !== 'undefined' && window.IAM_ADDRESS_NEW) ? window.IAM_ADDRESS_NEW : '0x2DdDD3Bfc8B591296695fFA1EF74F7114140cC26'; // New contract
const IAM_ADDRESS_MIDDLE = '0xF473F20017f7aC6c2d636e2D3e8b5fE0E8142658'; // Middle contract (placeholder)
// Use global DAI address from config to avoid redeclaration conflicts
const SWAP_DAI_ADDRESS = (typeof window !== 'undefined' && window.DAI_ADDRESS) ? window.DAI_ADDRESS : '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';

// Default to old contract for swap
let SWAP_IAM_ADDRESS = IAM_ADDRESS_OLD;

// DAI ABI (minimal for swap functionality)
const DAI_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "spender", "type": "address"},
            {"internalType": "uint256", "name": "value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// IAM ABI (minimal for swap functionality)
const IAM_ABI = [
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
				"name": "amountIAM",
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
				"name": "points",
				"type": "uint256"
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
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BinaryPointsClaimed",
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
		"inputs": [],
		"name": "claim",
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
				"indexed": false,
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
		"name": "IndexOwnershipTransferred",
		"type": "event"
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
				"indexed": false,
				"internalType": "uint256",
				"name": "newPointValue",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalClaimablePoints",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "contractTokenBalance",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "PointValueUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amountIAM",
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
				"name": "amountIAM",
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
				"name": "upper",
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
				"indexed": false,
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "daiBalance",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenSupply",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "TokenPriceUpdated",
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
				"name": "referrer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "upper",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "depositedAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "UserRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isLike",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "VoteSubmitted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isLike",
				"type": "bool"
			}
		],
		"name": "voteUser",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "dislikeCount",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getPointUpgradeCost",
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
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getVoteStatus",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalLikes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalDislikes",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "userVoteStatus",
				"type": "uint8"
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
		"name": "likeCount",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userVotes",
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

class SwapManager {
    constructor() {
        console.log('🏗️ Creating SwapManager instance...');
        
        this.tokenPrice = null;
        this.userBalances = { dai: 0, IAM: 0 };
        this.isSwapping = false;
        this.isRefreshing = false;
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.daiContract = null;
        this.selectedContract = 'old'; // Default to old contract
        
        console.log('✅ SwapManager created');
    }

    // Switch contract (support old, middle, and new contracts)
    async switchContract(contractType) {
        console.log('🔄 Switching to contract:', contractType);
        
        // Select contract address based on type
        switch(contractType) {
            case 'old':
                SWAP_IAM_ADDRESS = IAM_ADDRESS_OLD;
                console.log('✅ Using old contract:', SWAP_IAM_ADDRESS);
                break;
            case 'middle':
                SWAP_IAM_ADDRESS = IAM_ADDRESS_MIDDLE;
                console.log('✅ Using middle contract:', SWAP_IAM_ADDRESS);
                break;
            case 'new':
                SWAP_IAM_ADDRESS = IAM_ADDRESS_NEW;
                console.log('✅ Using new contract:', SWAP_IAM_ADDRESS);
                break;
            default:
                SWAP_IAM_ADDRESS = IAM_ADDRESS_OLD;
                console.log('⚠️ Unknown contract type, using old contract');
        }
        
        this.selectedContract = contractType;
        
        // Recreate contract instance if wallet is connected
        if (this.signer) {
            this.contract = new ethers.Contract(SWAP_IAM_ADDRESS, IAM_ABI, this.signer);
            console.log('✅ Contract instance created with address:', SWAP_IAM_ADDRESS);
            
            // Refresh data with selected contract
            await this.refreshSwapData();
        }
        
        // Update UI to restrict swap direction
        this.updateSwapDirectionUI();
    }
    
    // Update swap direction UI based on contract type
    updateSwapDirectionUI() {
        const directionSelect = document.getElementById('swapDirection');
        if (!directionSelect) return;
        
        // Only old contract supports buying tokens
        if (this.selectedContract === 'old') {
            // Enable buy option
            if (directionSelect.querySelector('option[value="dai-to-IAM"]')) {
                directionSelect.querySelector('option[value="dai-to-IAM"]').style.display = 'block';
                directionSelect.querySelector('option[value="dai-to-IAM"]').disabled = false;
            }
            console.log('✅ Old contract: Buy and sell options enabled');
        } else {
            // Only sell option for middle and new contracts
            if (directionSelect.querySelector('option[value="dai-to-IAM"]')) {
                directionSelect.querySelector('option[value="dai-to-IAM"]').style.display = 'none';
                directionSelect.querySelector('option[value="dai-to-IAM"]').disabled = true;
            }
            
            // Set default to sell if currently on buy
            if (directionSelect.value === 'dai-to-IAM') {
                directionSelect.value = 'IAM-to-dai';
            }
            
            console.log('⚠️ Non-default contract: Only sell option enabled');
        }
    }

    // Connect to wallet and initialize contracts
    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask not detected');
            }

            console.log('🔗 Connecting to wallet...');
            
            // Request account access with error handling
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (rpcError) {
                // Handle specific RPC errors gracefully
                if (rpcError.code === 4001) {
                    throw new Error('User rejected the connection request');
                } else if (rpcError.message && rpcError.message.includes('isDefaultWallet')) {
                    console.warn('⚠️ MetaMask RPC method not available, continuing...');
                    // Continue with connection attempt
                } else {
                    throw rpcError;
                }
            }
            
            // Create provider and signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            
            // Create contracts
            this.contract = new ethers.Contract(SWAP_IAM_ADDRESS, IAM_ABI, this.signer);
            this.daiContract = new ethers.Contract(SWAP_DAI_ADDRESS, DAI_ABI, this.signer);
            
            console.log('✅ Wallet connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            throw error;
        }
    }

    // Helper: Reading contract DAI balance as numeric (with decimals)
    // Always check old contract balance for market status
    async getContractDaiBalanceNum() {
        if (!this.daiContract) {
            console.warn('⚠️ DAI contract not initialized');
            return 0;
        }
        
        try {
            // Always use old contract for market backing status
            // Use window variable to avoid redeclaration conflict
            const oldContractAddress = (typeof window !== 'undefined' && window.IAM_ADDRESS_OLD) ? window.IAM_ADDRESS_OLD : IAM_ADDRESS_OLD;
            const daiBalance = await this.daiContract.balanceOf(oldContractAddress);
            return parseFloat(ethers.formatUnits(daiBalance, 18));
        } catch (error) {
            console.warn('⚠️ Error getting contract DAI balance:', error);
            return 0;
        }
    }

    // Helper: Determine backing fee tier based on contract DAI balance
    getBackingFeePct(daiContractBalanceNum) {
        // Ranges based on contract logic: <=200k: 2%, <=500k: 2.5%, more: 3%
        if (daiContractBalanceNum <= 200000) return 0.02;
        if (daiContractBalanceNum <= 500000) return 0.025;
        return 0.03;
    }


    async initializeSwap() {
        try {
            console.log('🔄 Starting SwapManager initialization...');
            
            // Ensure DOM elements exist
            const requiredElements = ['swapForm', 'swapDirection', 'swapAmount', 'maxBtn', 'swapStatus'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.warn('⚠️ The following elements were not found:', missingElements);
                console.log('🔄 Waiting for DOM elements to load...');
                // Wait a bit more for DOM to load
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Check again
                const stillMissing = requiredElements.filter(id => !document.getElementById(id));
                if (stillMissing.length > 0) {
                    console.error('❌ Still missing elements after wait:', stillMissing);
                    return;
                }
            }
            
            console.log('✅ All DOM elements exist');
            
            // Setup event listeners
            this.setupEventListeners();
            console.log('✅ Event listeners configured');
            
            // Connect to wallet first
            await this.connectWallet();
            console.log('✅ Wallet connected');
            
            // Load data
            await this.loadSwapData();
            console.log('✅ Swap data loaded');
            
            // Update UI
            this.updateMaxAmount();
            this.updateContractSelectionUI();
            this.updateSwapDirectionUI();
            
            console.log('✅ SwapManager successfully initialized');
            
        } catch (error) {
            console.error('❌ Error initializing SwapManager:', error);
            this.showStatus('Error loading swap: ' + error.message, 'error');
        }
    }



    // Function to convert USD to token (for USD field)
    convertSwapUsdToToken() {
        console.log('🔄 Converting USD to token...');
        
        const usdAmount = document.getElementById('swapUsdAmount');
        const swapAmount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        
        if (!usdAmount || !swapAmount || !direction) {
            console.warn('⚠️ Required elements for USD conversion not found');
            return;
        }
        
        const usdValue = parseFloat(usdAmount.value);
        if (!usdValue || usdValue <= 0) {
            this.showStatus('Please enter a valid dollar amount (minimum $0.01)', 'error');
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            this.showStatus('Token price is currently unavailable. Please try again later.', 'error');
            return;
        }
        
        const tokenPrice = Number(this.tokenPrice);
        
        if (direction.value === 'dai-to-IAM') {
            // Convert USD to DAI (assuming 1 USD = 1 DAI)
            const daiAmount = usdValue;
            swapAmount.value = daiAmount.toFixed(2);
            console.log('✅ USD converted to DAI:', daiAmount);
        } else if (direction.value === 'IAM-to-dai') {
            // Convert USD to IAM
            const IAMAmount = usdValue / tokenPrice;
            swapAmount.value = IAMAmount.toFixed(6);
            console.log('✅ USD converted to IAM:', IAMAmount);
        }
        
        this.showStatus(`✅ Successfully converted $${usdValue} to token amount. You can now proceed with your transaction.`, 'success');
    }

    // Update dollar equivalent when token amount changes
    updateSwapUsdValue() {
        const swapAmount = document.getElementById('swapAmount');
        const swapUsdAmount = document.getElementById('swapUsdAmount');
        const direction = document.getElementById('swapDirection');
        
        if (!swapAmount || !swapUsdAmount || !direction) {
            return;
        }
        
        const tokenAmount = parseFloat(swapAmount.value) || 0;
        if (tokenAmount <= 0) {
            swapUsdAmount.value = '';
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            return;
        }
        
        const tokenPrice = Number(this.tokenPrice);
        
        if (direction.value === 'dai-to-IAM') {
            // DAI to USD (assuming 1 DAI = 1 USD)
            const usdValue = tokenAmount;
            swapUsdAmount.value = usdValue.toFixed(2);
        } else if (direction.value === 'IAM-to-dai') {
            // IAM to USD
            const usdValue = tokenAmount * tokenPrice;
            swapUsdAmount.value = usdValue.toFixed(2);
        }
    }

    // Show/hide USD field based on swap direction
    toggleSwapUsdConverter() {
        const direction = document.getElementById('swapDirection');
        const usdConverterRow = document.getElementById('swap-usd-converter-row');
        
        if (!direction || !usdConverterRow) {
            return;
        }
        
        if (direction.value === 'IAM-to-dai') {
            usdConverterRow.style.display = 'block';
        } else {
            usdConverterRow.style.display = 'none';
        }
    }

    // Update USD preview
    updateSwapUsdPreview() {
        const swapUsdAmount = document.getElementById('swapUsdAmount');
        const swapAmount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        
        if (!swapUsdAmount || !swapAmount || !direction) {
            return;
        }
        
        const usdValue = parseFloat(swapUsdAmount.value) || 0;
        if (usdValue <= 0) {
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            return;
        }
        
        const tokenPrice = Number(this.tokenPrice);
        
        if (direction.value === 'IAM-to-dai') {
            const IAMAmount = usdValue / tokenPrice;
            swapAmount.value = IAMAmount.toFixed(6);
        }
    }



    // Update contract selection UI
    updateContractSelectionUI() {
        const contractSelector = document.getElementById('contractSelector');
        if (contractSelector) {
            // Update all contract options with short addresses
            const oldOption = contractSelector.querySelector('option[value="old"]');
            const middleOption = contractSelector.querySelector('option[value="middle"]');
            const newOption = contractSelector.querySelector('option[value="new"]');
            
            if (oldOption) {
                oldOption.textContent = `Old Contract — ${IAM_ADDRESS_OLD.substring(0, 6)}...${IAM_ADDRESS_OLD.substring(38)} (Default)`;
            }
            if (middleOption) {
                middleOption.textContent = `Middle Contract — ${IAM_ADDRESS_MIDDLE.substring(0, 6)}...${IAM_ADDRESS_MIDDLE.substring(38)}`;
            }
            if (newOption) {
                newOption.textContent = `New Contract — ${IAM_ADDRESS_NEW.substring(0, 6)}...${IAM_ADDRESS_NEW.substring(38)}`;
            }
            
            contractSelector.value = this.selectedContract;
        }
        
        // Get current contract address
        let currentAddress;
        switch(this.selectedContract) {
            case 'old':
                currentAddress = IAM_ADDRESS_OLD;
                break;
            case 'middle':
                currentAddress = IAM_ADDRESS_MIDDLE;
                break;
            case 'new':
                currentAddress = IAM_ADDRESS_NEW;
                break;
            default:
                currentAddress = IAM_ADDRESS_OLD;
        }
        
        const contractInfo = document.getElementById('contractInfo');
        if (contractInfo) {
            const nameLabel = this.selectedContract === 'old' ? 'Old Contract' : 
                             this.selectedContract === 'middle' ? 'Middle Contract' : 'New Contract';
            const nameColor = this.selectedContract === 'old' ? '#ff8c00' : 
                             this.selectedContract === 'middle' ? '#ff6b6b' : '#00ff88';
            
            // Short address format
            const shortAddress = `${currentAddress.substring(0, 6)}...${currentAddress.substring(38)}`;
            
            contractInfo.innerHTML = `
                <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 6px; padding: 0.5rem 0.6rem; margin-bottom: 0.4rem;">
                    <div style="display:flex; justify-content: space-between; gap:10px; align-items:center; flex-wrap:wrap;">
                        <p style="margin: 0; color: ${nameColor}; font-size: 0.8rem; font-weight:700;">${nameLabel}</p>
                        <p style="margin: 0; color: #9ecbff; font-size: 0.75rem;" title="${currentAddress}">${shortAddress}</p>
                    </div>
                </div>
            `;
        }
    }

    // Call updateSwapLimitInfo on direction/amount change
    setupEventListeners() {
        console.log('🔄 Setting up event listeners...');
        
        const swapForm = document.getElementById('swapForm');
        const swapDirection = document.getElementById('swapDirection');
        const swapAmount = document.getElementById('swapAmount');
        const maxBtn = document.getElementById('maxBtn');
        const contractSelector = document.getElementById('contractSelector');

        if (swapForm) {
            swapForm.addEventListener('submit', (e) => {
                console.log('📝 Swap form submitted');
                this.handleSwap(e);
            });
            console.log('✅ Swap form event listener connected');
        } else {
            console.warn('⚠️ Swap form not found');
        }
        
        if (swapDirection) {
            swapDirection.addEventListener('change', async () => {
                console.log('🔄 Swap direction changed:', swapDirection.value);
                this.updateMaxAmount();
                
                // Show/hide USD field based on swap direction
                this.toggleSwapUsdConverter();
            });
            console.log('✅ Swap direction event listener connected');
        } else {
            console.warn('⚠️ Swap direction not found');
        }
        
        if (swapAmount) {
            swapAmount.addEventListener('input', async () => {
                console.log('📝 Swap amount changed:', swapAmount.value);
                // Allow decimals; no truncation
                // Real-time calculation of dollar equivalent when token amount changes
                this.updateSwapUsdValue();
            });
            console.log('✅ Swap amount event listener connected');
        } else {
            console.warn('⚠️ Swap amount not found');
        }
        
        if (maxBtn) {
            maxBtn.addEventListener('click', async (e) => {
                e.preventDefault(); // Prevent default button behavior
                e.stopPropagation(); // Stop event bubbling
                console.log('🔢 Max button clicked');
                try {
                    // Check if balances are loaded
                    if (!this.userBalances || (this.userBalances.dai === 0 && this.userBalances.IAM === 0)) {
                        console.log('🔄 Balances not loaded, loading now...');
                        await this.loadSwapData();
                    }
                    
                    await this.setMaxAmount();
                    // Don't show status message to avoid scrolling to Exchange Information section
                    // this.showStatus('✅ Maximum available amount has been set. You can now proceed with your transaction.', 'success');
                } catch (error) {
                    console.error('❌ Error in max button click:', error);
                    this.showStatus('Unable to set maximum amount. Please enter the amount manually.', 'error');
                }
            });
            console.log('✅ Max button event listener connected');
        } else {
            console.warn('⚠️ Max button not found');
        }
        
        if (contractSelector) {
            contractSelector.addEventListener('change', async (e) => {
                console.log('🔄 Contract selector changed to:', e.target.value);
                try {
                    await this.switchContract(e.target.value);
                    this.updateContractSelectionUI();
                    this.showStatus(`✅ Using Old contract (only option available)`, 'success');
                } catch (error) {
                    console.error('❌ Error switching contract:', error);
                    this.showStatus('Error switching contract: ' + error.message, 'error');
                }
            });
            console.log('✅ Contract selector event listener connected');
        } else {
            console.warn('⚠️ Contract selector not found');
        }
        
        // Event listeners for USD converter
        const swapUsdConverterRow = document.getElementById('swap-usd-converter-row');
        const swapUsdAmount = document.getElementById('swapUsdAmount');
        const swapUsdToTokenBtn = document.getElementById('swapUsdToTokenBtn');
        
        if (swapUsdToTokenBtn) {
            swapUsdToTokenBtn.addEventListener('click', () => {
                this.convertSwapUsdToToken();
            });
            console.log('✅ USD convert button event listener connected');
        }
        
        if (swapUsdAmount) {
            // Enter key in USD field
            swapUsdAmount.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.convertSwapUsdToToken();
                }
            });
            
            // Real-time calculation when user types
            let swapUsdTimeout;
            swapUsdAmount.addEventListener('input', () => {
                clearTimeout(swapUsdTimeout);
                swapUsdTimeout = setTimeout(() => {
                    this.updateSwapUsdPreview();
                }, 500);
            });
            console.log('✅ USD field event listeners connected');
        }
        
        // Initial execution to set initial state
        this.toggleSwapUsdConverter();
        
        console.log('✅ All event listeners configured');
    }

    async loadSwapData() {
        try {
            console.log('🔄 Loading swap data...');
            
            // Check if wallet is connected
            if (!this.contract || !this.signer) {
                console.log('⏳ Wallet not connected, connecting now...');
                await this.connectWallet();
            }
            
            const address = await this.signer.getAddress();
            
            console.log('✅ Contract connection established');

            // Token price from contract
            console.log('🔄 Fetching token price...');
            try {
                const tokenPrice = await Promise.race([
                    this.contract.getTokenPrice(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Token price fetch timeout')), 10000))
                ]);
                this.tokenPrice = ethers.formatUnits(tokenPrice, 18);
            console.log('✅ Token price received:', this.tokenPrice);
                console.log('🔍 this.tokenPrice set to:', this.tokenPrice);
            } catch (error) {
                console.warn('⚠️ Error fetching token price:', error);
                this.tokenPrice = null;
            }

            // IAM balance
            let IAMBalanceFormatted = '0';
            try {
                const IAMBalance = await Promise.race([
                    this.contract.balanceOf(address),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('IAM balance fetch timeout')), 10000))
                ]);
                IAMBalanceFormatted = ethers.formatUnits(IAMBalance, 18);
            console.log('✅ IAM balance received:', IAMBalanceFormatted);
            } catch (error) {
                console.warn('⚠️ Error fetching IAM balance:', error);
            }

            // DAI balance
            let daiBalanceFormatted = '0';
            try {
                const daiBalance = await Promise.race([
                    this.daiContract.balanceOf(address),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('DAI balance fetch timeout')), 10000))
                ]);
                daiBalanceFormatted = ethers.formatUnits(daiBalance, 18);
                console.log('✅ DAI balance received:', daiBalanceFormatted);
            } catch (error) {
                console.warn('⚠️ Error fetching DAI balance:', error);
            }

            // Function to shorten large numbers
            function formatLargeNumber(num) {
                if (num >= 1000000) {
                    return (num / 1000000).toFixed(1) + 'M';
                } else if (num >= 1000) {
                    return (num / 1000).toFixed(1) + 'K';
                } else {
                    return num.toFixed(2);
                }
            }
            
            // Calculate IAM dollar equivalent
            const IAMUsdValue = parseFloat(IAMBalanceFormatted) * parseFloat(this.tokenPrice);
            
            // Display balances
            const IAMBalanceEl = document.getElementById('IAMBalance');
            const daiBalanceEl = document.getElementById('daiBalance');
            if (IAMBalanceEl) {
                const fullIAMAmount = Number(IAMBalanceFormatted).toLocaleString('en-US', {maximumFractionDigits: 6});
                IAMBalanceEl.innerHTML = `
                    <span title="${fullIAMAmount} IAM">${formatLargeNumber(Number(IAMBalanceFormatted))} IAM</span>
                    <div style="font-size:0.8rem;color:#a786ff;margin-top:2px;">≈ $${formatLargeNumber(IAMUsdValue)}</div>
                `;
            }
            if (daiBalanceEl) {
                const fullDaiAmount = Number(daiBalanceFormatted).toLocaleString('en-US', {maximumFractionDigits: 6});
                daiBalanceEl.innerHTML = `<span title="${fullDaiAmount} DAI">${formatLargeNumber(Number(daiBalanceFormatted))} DAI</span>`;
            }

            // Save for max
            this.userBalances = {
                IAM: parseFloat(IAMBalanceFormatted),
                dai: parseFloat(daiBalanceFormatted)
            };
            
            console.log('✅ User balances saved:', this.userBalances);
            

            
        } catch (error) {
            console.error('❌ Error loading swap data:', error);
            this.tokenPrice = null;
            this.userBalances = { IAM: 0, dai: 0 };
            this.showStatus('Unable to load wallet balances. Please check your connection and try again.', 'error');
        }
    }





    updateMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const amount = document.getElementById('swapAmount');
        
        if (!direction || !amount) {
            console.warn('⚠️ Required elements for updateMaxAmount not found');
            return;
        }
        
        // Remove all input field restrictions - allow unlimited input
        amount.max = '';
        console.log('✅ No input restrictions - unlimited amounts allowed');
    }

    async setMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const amount = document.getElementById('swapAmount');
        
        if (!direction || !amount) {
            console.warn('⚠️ Required elements for setMaxAmount not found');
            return;
        }
        
        try {
            console.log('🔢 Setting maximum amount for direction:', direction.value);
            console.log('💰 Current user balances:', this.userBalances);
            
            if (direction.value === 'dai-to-IAM') {
                // For DAI to IAM (buying IAM)
                if (this.userBalances.dai <= 0) {
                    console.warn('⚠️ No DAI balance available');
                    this.showStatus('No DAI balance available. Please add DAI to your wallet to make purchases.', 'error');
                    return;
                }
                
                // Use 99.9% of DAI balance (no decimals)
                const safeDaiAmount = Math.floor(parseFloat(this.userBalances.dai.toFixed(2)) * 0.999);
                amount.value = safeDaiAmount.toString();
                
                console.log('✅ Safe DAI amount set from balance card (99.9%):', {
                    userBalance: this.userBalances.dai.toFixed(2),
                    maxAmount: safeDaiAmount
                });
                
            } else if (direction.value === 'IAM-to-dai') {
                // For IAM to DAI (selling IAM) - Use 99.9% of balance
                if (this.userBalances.IAM <= 0) {
                    console.warn('⚠️ No IAM balance available');
                    this.showStatus('No IAM balance available. Please purchase IAM tokens first to make sales.', 'error');
                    return;
                }
                
                // Use 99.9% of IAM balance to ensure transaction succeeds (leave small buffer)
                const safeIAMAmount = Math.floor(parseFloat(this.userBalances.IAM.toFixed(6)) * 0.999);
                amount.value = safeIAMAmount.toString();
                
                console.log('✅ Safe IAM amount set from balance card (99.9%):', {
                    userBalance: this.userBalances.IAM.toFixed(6),
                    maxAmount: safeIAMAmount
                });
            }
            
            console.log('✅ Exact maximum amount set successfully');
            
        } catch (error) {
            console.error('❌ Error setting maximum amount:', error);
            this.showStatus('Error setting maximum amount: ' + error.message, 'error');
            
            // Fallback: set to safe balance amounts
            try {
                if (direction.value === 'dai-to-IAM' && this.userBalances.dai > 0) {
                    // Use 99.9% of DAI balance to ensure transaction succeeds
                    const safeDaiAmount = Math.floor(parseFloat(this.userBalances.dai.toFixed(2)) * 0.999);
                    amount.value = safeDaiAmount.toString();
                } else if (direction.value === 'IAM-to-dai' && this.userBalances.IAM > 0) {
                    // Use 99.9% of IAM balance to ensure transaction succeeds
                    const safeIAMAmount = Math.floor(parseFloat(this.userBalances.IAM.toFixed(6)) * 0.999);
                    amount.value = safeIAMAmount.toString();
                }
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
            }
        }
    }

    setUIBusy(busy) {
        console.log('🔄 Setting UI state:', busy ? 'busy' : 'ready');
        
        const submitBtn = document.querySelector('#swapForm button[type="submit"]');
        const inputs = document.querySelectorAll('#swapForm input, #swapForm select');
        
        if (submitBtn) {
            submitBtn.disabled = busy;
            submitBtn.textContent = busy ? '⏳ Processing...' : '💱 Swap';
            submitBtn.style.opacity = busy ? '0.7' : '1';
            submitBtn.style.cursor = busy ? 'not-allowed' : 'pointer';
            console.log('✅ Submit button configured');
        } else {
            console.warn('⚠️ Submit button not found');
        }
        
        inputs.forEach(input => {
            input.disabled = busy;
        });
        
        console.log(`✅ ${inputs.length} input elements configured`);
    }

    getErrorMessage(error) {
        console.log('🔍 Analyzing error:', error);
        
        if (error.code === 4001) return 'Transaction cancelled by user. Please try again when ready.';
        if (error.message && error.message.includes('insufficient funds')) return 'Insufficient balance. Please check your wallet and try again.';
        if (error.message && error.message.includes('exceeds buy limit')) return 'Purchase amount exceeds daily limit. Please reduce the amount.';
        if (error.message && error.message.includes('exceeds sell limit')) return 'Sale amount exceeds available liquidity. Please try a smaller amount.';
        if (error.message && error.message.includes('minimum')) return 'Amount is below minimum threshold. Please increase your transaction amount.';
        if (error.message && error.message.includes('allowance')) return 'DAI approval required. Please approve DAI spending first.';
        if (error.message && error.message.includes('cooldown')) return 'Please wait before making another transaction. Cooldown period active.';
        if (error.message && error.message.includes('user rejected')) return 'Transaction rejected by user. Please confirm the transaction to proceed.';
        if (error.message && error.message.includes('network')) return 'Network connection error. Please check your internet and try again.';
        if (error.message && error.message.includes('timeout')) return 'Transaction timeout. Please try again with higher gas fees.';
        if (error.message && error.message.includes('gas')) return 'Insufficient gas for transaction. Please increase gas limit.';
        if (error.message && error.message.includes('revert')) return 'Transaction failed. Please check your inputs and try again.';
        
        return error.message || 'An unexpected error occurred. Please try again.';
    }

    showStatus(message, type = 'info', txHash = null, scrollToMessage = true) {
        console.log('📢 Displaying message:', { message, type, txHash });
        
        const statusEl = document.getElementById('swapStatus');
        if (!statusEl) {
            console.warn('⚠️ swapStatus element not found');
            return;
        }
        
        let className = 'swap-status';
        let icon = '';
        
        switch(type) {
            case 'success':
                className += ' success';
                icon = '✅ ';
                break;
            case 'error':
                className += ' error';
                icon = '❌ ';
                break;
            case 'loading':
                className += ' loading';
                icon = '⏳ ';
                break;
            default:
                className += ' info';
                icon = 'ℹ️ ';
        }
        
        let html = `${icon}${message}`;
        if (txHash) {
            html += `<br><small style="color:#666;">Transaction: ${txHash}</small>`;
        }
        
        statusEl.className = className;
        statusEl.innerHTML = html;
        
        // Scroll to message only if requested
        if (scrollToMessage) {
            statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        console.log('✅ Message displayed');
    }

    // Show English popup with transaction details
    showEnglishPopup(message, type, transactionDetails = null) {
        console.log('📢 Showing English popup:', { message, type, transactionDetails });
        
        // Remove any existing popup
        const existingPopup = document.querySelector('.swap-popup-overlay');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup overlay
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'swap-popup-overlay';
        popupOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Montserrat', 'Arial', sans-serif;
        `;
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
            background: linear-gradient(135deg, #1a1f2e, #2a3441);
            border: 2px solid ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#a786ff'};
            border-radius: 15px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
            color: #ffffff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: popupSlideIn 0.3s ease-out;
        `;
        
        // Add animation keyframes
        if (!document.querySelector('#swap-popup-animations')) {
            const style = document.createElement('style');
            style.id = 'swap-popup-animations';
            style.textContent = `
                @keyframes popupSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set icon and color based on type
        let icon = '';
        let titleColor = '';
        switch(type) {
            case 'success':
                icon = '✅';
                titleColor = '#00ff88';
                break;
            case 'error':
                icon = '❌';
                titleColor = '#ff4444';
                break;
            case 'loading':
                icon = '⏳';
                titleColor = '#a786ff';
                break;
            default:
                icon = 'ℹ️';
                titleColor = '#a786ff';
        }
        
        // Create popup HTML
        let popupHTML = `
            <div style="font-size: 2rem; margin-bottom: 1rem;">${icon}</div>
            <h3 style="color: ${titleColor}; margin: 0 0 1rem 0; font-size: 1.2rem; font-weight: 600;">${message}</h3>
        `;
        
        // Add transaction details for success popups
        if (type === 'success' && transactionDetails) {
            popupHTML += `
                <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: left;">
                    <h4 style="color: #00ff88; margin: 0 0 0.5rem 0; font-size: 1rem;">Transaction Details</h4>
                    <div style="font-size: 0.9rem; line-height: 1.4;">
                        <div style="margin-bottom: 0.3rem;"><strong>Type:</strong> ${transactionDetails.type}</div>
                        <div style="margin-bottom: 0.3rem;"><strong>Amount:</strong> ${transactionDetails.amount}</div>
                        <div style="margin-bottom: 0.3rem;"><strong>Direction:</strong> ${transactionDetails.direction}</div>
                        <div style="margin-bottom: 0.3rem;"><strong>Transaction Hash:</strong> 
                            <span style="font-family: monospace; color: #a786ff;">${transactionDetails.hash.substring(0, 10)}...${transactionDetails.hash.substring(transactionDetails.hash.length - 8)}</span>
                        </div>
                    </div>
                    <button id="copySwapHashBtn" style="
                        background: linear-gradient(135deg, #a786ff, #00ff88);
                        color: #0a0f1c;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-top: 0.5rem;
                        font-size: 0.8rem;
                    ">Copy Hash</button>
                </div>
            `;
        }
        
        // Add close button
        popupHTML += `
            <button id="closeSwapPopupBtn" style="
                background: linear-gradient(135deg, #ff4444, #cc3333);
                color: #ffffff;
                border: none;
                padding: 0.8rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 0.9rem;
                margin-top: 1rem;
            ">Close</button>
        `;
        
        popupContent.innerHTML = popupHTML;
        popupOverlay.appendChild(popupContent);
        document.body.appendChild(popupOverlay);
        
        // Add event listeners
        const closeBtn = document.getElementById('closeSwapPopupBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popupOverlay.remove();
            });
        }
        
        // Add copy hash functionality for success popups
        if (type === 'success' && transactionDetails) {
            const copyBtn = document.getElementById('copySwapHashBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(transactionDetails.hash);
                        copyBtn.textContent = 'Copied!';
                        copyBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)';
                        setTimeout(() => {
                            copyBtn.textContent = 'Copy Hash';
                            copyBtn.style.background = 'linear-gradient(135deg, #a786ff, #00ff88)';
                        }, 2000);
                    } catch (error) {
                        console.error('Failed to copy hash:', error);
                    }
                });
            }
        }
        
        console.log('✅ English popup displayed');
    }

    // Get English error message
    getEnglishErrorMessage(error) {
        console.log('🔍 Analyzing error for English message:', error);
        
        if (error.code === 4001) return 'Transaction cancelled by user. Please try again when ready.';
        if (error.message && error.message.includes('insufficient funds')) return 'Insufficient balance. Please check your wallet and try again.';
        if (error.message && error.message.includes('exceeds buy limit')) return 'Purchase amount exceeds daily limit. Please reduce the amount.';
        if (error.message && error.message.includes('exceeds sell limit')) return 'Sale amount exceeds available liquidity. Please try a smaller amount.';
        if (error.message && error.message.includes('minimum')) return 'Amount is below minimum threshold. Please increase your transaction amount.';
        if (error.message && error.message.includes('allowance')) return 'DAI approval required. Please approve DAI spending first.';
        if (error.message && error.message.includes('cooldown')) return 'Please wait before making another transaction. Cooldown period active.';
        if (error.message && error.message.includes('user rejected')) return 'Transaction rejected by user. Please confirm the transaction to proceed.';
        if (error.message && error.message.includes('network')) return 'Network connection error. Please check your internet and try again.';
        if (error.message && error.message.includes('timeout')) return 'Transaction timeout. Please try again with higher gas fees.';
        if (error.message && error.message.includes('gas')) return 'Insufficient gas for transaction. Please increase gas limit.';
        if (error.message && error.message.includes('revert')) return 'Transaction failed. Please check your inputs and try again.';
        
        return error.message || 'An unexpected error occurred. Please try again.';
    }

    // Reset swap button state
    resetSwapButton(swapBtn, oldText) {
        if (swapBtn) {
            swapBtn.disabled = false;
            swapBtn.textContent = oldText;
            swapBtn.style.opacity = '1';
            swapBtn.style.cursor = 'pointer';
        }
    }

    // Main swap function
    async handleSwap(e) {
        e.preventDefault();
        console.log('🔄 Starting swap operation...');
        
        if (this.isSwapping) {
            console.log('⚠️ Swap operation in progress');
            return;
        }
        
        // Get swap button and store original text
        const swapBtn = document.querySelector('#swapForm button[type="submit"]');
        const originalText = swapBtn ? swapBtn.textContent : '💱 Swap';
        
        this.isSwapping = true;
        
        try {
            const amount = document.getElementById('swapAmount');
            const direction = document.getElementById('swapDirection');
            
            if (!amount || !direction) {
                throw new Error('Form incomplete - required elements not found');
            }
            
            const value = parseFloat(amount.value);
            if (!value || value <= 0) {
                throw new Error('Invalid amount - please enter a positive value');
            }
            
            // Allow decimal amounts (no integer-only restriction)
            
            console.log('📊 Swap information:', {
                direction: direction.value,
                amount: value,
                userBalances: this.userBalances
            });
            
            // Restrict swap direction based on contract type
            // Only old contract can buy tokens; other contracts can only sell
            if (direction.value === 'dai-to-IAM' && this.selectedContract !== 'old') {
                throw new Error(`Buying tokens is only available on the Old Contract. Please switch to Old Contract to purchase tokens.`);
            }
            
            // Check balance
            if (direction.value === 'dai-to-IAM' && value > this.userBalances.dai) {
                throw new Error(`Insufficient DAI balance. You have ${this.userBalances.dai.toFixed(6)} DAI, but trying to spend ${value.toFixed(6)} DAI. Please reduce the amount.`);
            }
            if (direction.value === 'IAM-to-dai' && value > this.userBalances.IAM) {
                throw new Error(`Insufficient IAM balance. You have ${this.userBalances.IAM.toFixed(6)} IAM, but trying to sell ${value.toFixed(6)} IAM. Please reduce the amount.`);
            }

            // Keep no explicit minimum/maximum checks here

            // Disable button and show processing message
            if (swapBtn) {
                swapBtn.disabled = true;
                swapBtn.textContent = '⏳ Processing...';
                swapBtn.style.opacity = '0.7';
                swapBtn.style.cursor = 'not-allowed';
            }

            // Show processing popup
            this.showEnglishPopup('🚀 Starting swap transaction...', 'loading');

            // Execute swap operation
            let transactionHash = null;
            let transactionType = '';
            let transactionDirection = '';
            
            if (direction.value === 'dai-to-IAM') {
                console.log('🛒 Starting IAM purchase with DAI...');
                transactionType = 'Token Purchase';
                transactionDirection = 'DAI → IAM';
                transactionHash = await this.buyTokensWithDAI(value);
            } else if (direction.value === 'IAM-to-dai') {
                console.log('💰 Starting IAM sale and DAI receipt...');
                transactionType = 'Token Sale';
                transactionDirection = 'IAM → DAI';
                transactionHash = await this.sellTokensForDAI(value);
            } else {
                throw new Error('Invalid conversion type');
            }
            
            // Show success popup with transaction details
            const transactionDetails = {
                hash: transactionHash,
                amount: `${value} ${direction.value === 'dai-to-IAM' ? 'DAI' : 'IAM'}`,
                type: transactionType,
                direction: transactionDirection
            };
            
            this.showEnglishPopup('🎉 Swap completed successfully!', 'success', transactionDetails);
            await this.refreshSwapData();
            amount.value = '';
            
            // Save active tab
            // No caching - tab state is not persisted
            
            console.log('✅ Swap operation completed successfully');
            
        } catch (error) {
            console.error('❌ Error in swap operation:', error);
            const errorMessage = this.getEnglishErrorMessage(error);
            this.showEnglishPopup(errorMessage, 'error');
        } finally {
            // Reset button state
            this.resetSwapButton(swapBtn, originalText);
            this.isSwapping = false;
        }
    }

    // Buy IAM with DAI (with allowance management)
    async buyTokensWithDAI(daiAmount) {
        console.log('🛒 Starting IAM purchase with DAI:', daiAmount);
        
        try {
            if (!this.contract || !this.signer || !this.daiContract) {
                throw new Error('Contract connection not established');
            }
            
            const address = await this.signer.getAddress();
            
            const daiAmountWei = ethers.parseUnits(daiAmount.toString(), 18);
            
            console.log('🔍 Checking allowance...');
            // Check allowance
            const allowance = await this.daiContract.allowance(address, SWAP_IAM_ADDRESS);
            console.log('📊 Current allowance:', ethers.formatUnits(allowance, 18));
            
            if (allowance < daiAmountWei) {
                console.log('🔐 Need to approve DAI allowance...');
                this.showEnglishPopup('🔐 DAI approval required! Please approve DAI spending to continue with your purchase.', 'loading');
                
                const approveTx = await this.daiContract.approve(SWAP_IAM_ADDRESS, ethers.MaxUint256);
                this.showEnglishPopup('⏳ DAI approval transaction submitted! Waiting for confirmation... This is a one-time setup.', 'loading');
                
                console.log('⏳ Waiting for approve confirmation...');
                await approveTx.wait(1);
                this.showEnglishPopup('✅ DAI approval successful! You can now proceed with your purchase.', 'success');
                console.log('✅ Approve confirmed');
            } else {
                console.log('✅ Allowance is sufficient');
            }
            
            // Buy IAM
            console.log('🛒 Starting IAM token purchase...');
            this.showEnglishPopup('🛒 Initiating IAM token purchase... Please wait while we process your transaction.', 'loading');
            
            const tx = await this.contract.buyTokens(daiAmountWei);
            this.showEnglishPopup('⏳ Transaction submitted! Waiting for blockchain confirmation... This may take a few moments.', 'loading');
            
            console.log('⏳ Waiting for purchase transaction confirmation...');
            await tx.wait(1);
            
            console.log('✅ Purchase completed successfully');
            return tx.hash; // Return transaction hash
            
        } catch (error) {
            console.error('❌ Error purchasing IAM:', error);
            throw error;
        }
    }

    // Sell IAM and receive DAI
    async sellTokensForDAI(IAMAmount) {
        console.log('💰 Starting IAM sale and DAI receipt:', IAMAmount);
        
        try {
            if (!this.contract) {
                throw new Error('Contract connection not established');
            }
            
            const IAMAmountWei = ethers.parseUnits(IAMAmount.toString(), 18);
            
            console.log('💰 Starting IAM token sale...');
            this.showEnglishPopup('💰 Processing IAM token sale... Please wait while we execute your transaction.', 'loading');
            
            const tx = await this.contract.sellTokens(IAMAmountWei);
            this.showEnglishPopup('⏳ Sale transaction submitted! Waiting for blockchain confirmation... This may take a few moments.', 'loading');
            
            console.log('⏳ Waiting for sale transaction confirmation...');
            await tx.wait(1);
            
            console.log('✅ Sale completed successfully');
            return tx.hash; // Return transaction hash
            
        } catch (error) {
            console.error('❌ Error selling IAM:', error);
            throw error;
        }
    }

    async refreshSwapData() {
        // Prevent multiple simultaneous refresh calls
        if (this.isRefreshing) {
            console.log('🔄 Refresh already in progress, skipping...');
            return;
        }
        
        this.isRefreshing = true;
        console.log('🔄 Refreshing swap data...');
        
        try {
            await this.loadSwapData();
            
            console.log('✅ Swap data refreshed');
        } catch (error) {
            console.error('❌ Error refreshing swap data:', error);
        } finally {
            this.isRefreshing = false;
        }
    }
    

}

// Auto initialization removed - now done in index.html
// document.addEventListener('DOMContentLoaded', async function() {
//     window.swapManager = new SwapManager();
//     await window.swapManager.initializeSwap();
// });

// Hook for wallet connection
if (window.connectWallet) {
    const originalConnectWallet = window.connectWallet;
    window.connectWallet = async function() {
        const result = await originalConnectWallet();
        setTimeout(async () => {
            if (window.swapManager) {
                await window.swapManager.refreshSwapData();
            }
        }, 1000);
        return result;
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwapManager;
} 

console.log('✅ SwapManager loaded');