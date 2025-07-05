// تنظیمات قرارداد LevelUp
const CONTRACT_ADDRESS = '0x6E86b7F3EEA331A35f64785063793529a115f49f';
const CONTRACT_LOTARY = '0x8c8C580f1A3e0Ddf3Ba52DA1B9D09D1406953a62';
const LOTARI_ABI =[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "groupId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "approveMemberForGroupDraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_memberCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_amountPerUser",
				"type": "uint256"
			}
		],
		"name": "createGroupDraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_memberCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_amountPerUser",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_winnersCount",
				"type": "uint256"
			}
		],
		"name": "createLottery",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "memberCount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountPerUser",
				"type": "uint256"
			}
		],
		"name": "GroupDrawCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "GroupDrawJoinRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "GroupDrawJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "round",
				"type": "uint256"
			}
		],
		"name": "GroupDrawPaid",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "round",
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
				"name": "deployerShare",
				"type": "uint256"
			}
		],
		"name": "GroupDrawWinner",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "lotteryId",
				"type": "uint256"
			}
		],
		"name": "joinLottery",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "LotteryCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "LotteryJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "winners",
				"type": "address[]"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "rewardPerWinner",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "deployerShare",
				"type": "uint256"
			}
		],
		"name": "LotteryWinners",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "groupId",
				"type": "uint256"
			}
		],
		"name": "payGroupDrawInstallment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "groupId",
				"type": "uint256"
			}
		],
		"name": "requestJoinGroupDraw",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"name": "",
				"type": "uint256"
			}
		],
		"name": "groupDraws",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "memberCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amountPerUser",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "round",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
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
		"name": "lotteries",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "memberCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amountPerUser",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winnersCount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextGroupDrawId",
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
		"name": "nextLotteryId",
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
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
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
		"name": "claim",
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
		"inputs": [],
		"name": "buyTokens",
		"outputs": [],
		"stateMutability": "payable",
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			}
		],
		"name": "RegistrationPriceUpdated",
		"type": "event"
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
		"stateMutability": "payable",
		"type": "receive"
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
		"name": "INITIAL_REGISTRATION_PRICE",
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
    return await preventConcurrentCalls('getUserProfile', async () => {
        try {
            const connection = await window.connectWallet();
            if (!connection || !connection.contract || !connection.address) {
                throw new Error('No wallet connection available');
            }
            
            const { contract, address, provider, signer } = connection;
            if (!address) {
                throw new Error('No wallet address available');
            }
            
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
                    window.retryRpcOperation(() => balanceProvider.getBalance(address), 2),
                    window.retryRpcOperation(() => contract.balanceOf(address), 2)
                ]);
            } catch (error) {
                console.error('Profile: Error fetching balances:', error);
            }
            // دریافت قیمت‌ها برای محاسبه ارزش دلاری
            let lvlPriceMatic = 0n;
            let polPriceUSD = 0;
            try {
                [lvlPriceMatic, polPriceUSD] = await Promise.all([
                    contract.getTokenPrice().catch(() => ethers.parseUnits("0.0012", 18)),
                    window.fetchPolUsdPrice()
                ]);
            } catch (error) {
                console.error('Profile: Error fetching prices:', error);
            }
            // محاسبه ارزش دلاری
            let lvlValueUSD = 0;
            if (lvlBalance && lvlPriceMatic && lvlBalance > 0n && lvlPriceMatic > 0n) {
                const lvlPriceMaticFormatted = ethers.formatUnits(lvlPriceMatic, 18);
                const lvlPriceUSD = parseFloat(lvlPriceMaticFormatted) * parseFloat(polPriceUSD);
                lvlValueUSD = parseFloat(ethers.formatUnits(lvlBalance, 18)) * lvlPriceUSD;
            }
            // محاسبه ارزش دلاری کل POL
            let polValueUSD = 0;
            if (polBalance && polPriceUSD && polBalance > 0n && polPriceUSD > 0) {
                polValueUSD = parseFloat(ethers.formatEther(polBalance)) * parseFloat(polPriceUSD);
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
            
            // در صورت خطا، اطلاعات پیش‌فرض برگردان
            const defaultProfile = {
                address: address || null,
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
            
            // ذخیره در cache حتی در صورت خطا
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    data: defaultProfile,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('Could not cache default profile:', e);
            }
            
            return defaultProfile;
        }
    });
};

// تابع مرکزی دریافت قیمت‌ها
window.getPrices = async function() {
    return await preventConcurrentCalls('getPrices', async () => {
        try {
            const connection = await window.connectWallet();
            if (!connection || !connection.contract) {
                throw new Error('No wallet connection available');
            }
            
            const { contract } = connection;
            // دریافت قیمت LVL/MATIC از قرارداد و قیمت MATIC/USD از API
            const [lvlPriceMatic, polPrice] = await Promise.all([
                contract.getTokenPrice().catch(() => ethers.parseUnits("0.0012", 18)),
                window.fetchPolUsdPrice()
            ]);
            if (polPrice === null || polPrice === undefined || isNaN(Number(polPrice))) throw new Error('No valid POL/USD price');
            const lvlPriceMaticFormatted = ethers.formatUnits(lvlPriceMatic, 18);
            // قیمت LVL/USD = (LVL/MATIC) * (MATIC/USD)
            const lvlPriceUSD = parseFloat(lvlPriceMaticFormatted) * parseFloat(polPrice);
            return {
                lvlPriceUSD: lvlPriceUSD.toFixed(6),
                lvlPricePol: lvlPriceMaticFormatted,
                polPrice: Number(polPrice).toFixed(6)
            };
        } catch (error) {
            console.error('Central: Error fetching prices:', error);
            return {
                lvlPriceUSD: null,
                lvlPricePol: null,
                polPrice: null
            };
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
                window.retryRpcOperation(() => contract.totalSupply(), 2).catch(() => 0n),
                window.retryRpcOperation(() => contract.getPointValue(), 2).catch(() => 0n)
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
                wallets = 0n;
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
                totalClaimableBinaryPoints = 0n;
            }
            
            return { totalSupply, pointValue, wallets, totalClaimableBinaryPoints };
        };
        
        // استفاده از retry mechanism
        const stats = await window.retryRpcOperation(getStatsWithRetry, 2);
        if (!stats) {
            // اگر retry موفق نبود، مقادیر پیش‌فرض برگردان
            return {
                totalSupply: "0",
                circulatingSupply: "0",
                binaryPool: "0",
                totalPoints: "0",
                totalClaimableBinaryPoints: "0",
                pointValue: "0",
                rewardPool: "0",
                contractTokenBalance: "0"
            };
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
                    contractTokenBalance = 0n;
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
        return {
            totalSupply: "0",
            circulatingSupply: "0",
            binaryPool: "0",
            totalPoints: "0",
            totalClaimableBinaryPoints: "0",
            pointValue: "0",
            rewardPool: "0",
            contractTokenBalance: "0"
        };
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
        
        // به‌روزرسانی عناصر UI
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toString();
            }
        };
        
        updateElement('network-points', parseInt(totalClaimableBinaryPoints.toString()));
        updateElement('network-rewards', parseInt(totalClaimableBinaryPoints.toString()));
        
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

// تابع دریافت قیمت MATIC (POL) به دلار از API
window.fetchPolUsdPrice = async function() {
    // کش کردن قیمت برای جلوگیری از درخواست‌های مکرر
    if (window.cachedPolPrice && window.cachedPolPrice.timestamp && 
        (Date.now() - window.cachedPolPrice.timestamp) < 300000) { // 5 دقیقه کش
        return window.cachedPolPrice.price;
    }

    // لیست API های جایگزین
    const apiEndpoints = [
        {
            name: 'Binance',
            url: 'https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT',
            parser: (data) => parseFloat(data.price)
        },
        {
            name: 'CoinGecko',
            url: 'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd',
            parser: (data) => data['matic-network']?.usd
        },
        {
            name: 'CoinCap',
            url: 'https://api.coincap.io/v2/assets/polygon',
            parser: (data) => parseFloat(data.data.priceUsd)
        }
    ];

    // تلاش با هر API
    for (const api of apiEndpoints) {
        try {
            console.log(`Trying ${api.name} API...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 ثانیه timeout
            
            const response = await fetch(api.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'LevelUp-DApp/1.0'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const price = api.parser(data);
                
                if (price && !isNaN(price) && price > 0) {
                    console.log(`${api.name} API success: ${price}`);
                    // ذخیره در کش
                    window.cachedPolPrice = {
                        price: price,
                        timestamp: Date.now(),
                        source: api.name
                    };
                    return price;
                }
            } else if (response.status === 429) {
                console.warn(`${api.name} API rate limited, trying next...`);
                continue;
            }
        } catch (e) {
            console.warn(`${api.name} API failed:`, e.message);
            continue;
        }
    }

    // اگر همه API ها شکست خوردند، از قیمت کش شده استفاده کن
    if (window.cachedPolPrice && window.cachedPolPrice.price) {
        console.log('Using cached price due to API failures');
        return window.cachedPolPrice.price;
    }

    // Fallback نهایی - قیمت ثابت
    const fallbackPrice = 0.85; // قیمت تقریبی MATIC
    console.log('Using fallback price');
    window.cachedPolPrice = {
        price: fallbackPrice,
        timestamp: Date.now(),
        source: 'fallback'
    };
    return fallbackPrice;
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
    
    // Handle "could not coalesce error" - این خطا معمولاً قابل نادیده گرفتن است
    if (error.message && error.message.includes('could not coalesce error')) {
        console.warn('Coalesce error - ignoring...');
        return null;
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
            const errorType = window.handleRpcError(error, 'retry operation');
            
            if (errorType === null) {
                // خطا نادیده گرفته شد
                return null;
            } else if (errorType === 'retry' && i < maxRetries - 1) {
                // انتظار کوتاه قبل از retry با exponential backoff
                const delay = Math.min(2000 * Math.pow(2, i), 10000); // حداکثر 10 ثانیه
                console.log(`Retrying operation in ${delay}ms (attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            } else if (errorType === 'wait' && i < maxRetries - 1) {
                // انتظار طولانی‌تر برای rate limit یا MetaMask processing
                const delay = Math.min(5000 * Math.pow(2, i), 15000); // حداکثر 15 ثانیه
                console.log(`Waiting before retry: ${delay}ms (attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            } else {
                // خطای نهایی
                console.error(`Operation failed after ${maxRetries} attempts:`, error);
                throw error;
            }
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

// تابع تست اتصال و قرارداد
window.testConnection = async function() {
    try {
        console.log('=== Testing Connection ===');
        
        // Test concurrent calls
        console.log('Testing concurrent connection calls...');
        const promises = [
            window.connectWallet(),
            window.connectWallet(),
            window.connectWallet(),
            window.getUserProfile(),
            window.getPrices(),
            window.checkConnection()
        ];
        
        const results = await Promise.allSettled(promises);
        console.log('Concurrent call results:', results);
        
        // تست اتصال کیف پول
        const connection = await window.checkConnection();
        console.log('Connection status:', connection);
        
        if (connection.connected) {
            // تست قرارداد
            const { contract } = await window.connectWallet();
            console.log('Contract address:', contract.target);
            
            // تست توابع ساده
            try {
                const totalSupply = await contract.totalSupply();
                console.log('Total supply:', ethers.formatUnits(totalSupply, 18));
            } catch (e) {
                console.error('Error calling totalSupply:', e);
            }
            
            try {
                const pointValue = await contract.getPointValue();
                console.log('Point value:', ethers.formatUnits(pointValue, 18));
            } catch (e) {
                console.error('Error calling getPointValue:', e);
            }
            
            try {
                const wallets = await contract.wallets();
                console.log('Wallets:', wallets.toString());
            } catch (e) {
                console.error('Error calling wallets:', e);
            }
            
            try {
                const totalPoints = await contract.totalClaimableBinaryPoints;
                console.log('Total points:', ethers.formatUnits(totalPoints, 18));
            } catch (e) {
                console.error('Error calling totalClaimableBinaryPoints:', e);
            }
        }
        
        return connection;
    } catch (error) {
        console.error('Test connection error:', error);
        return { connected: false, error: error.message };
    }
};

// تابع تست API قیمت‌ها
window.testPriceAPI = async function() {
    try {
        console.log('=== Testing Price API ===');
        
        const polPrice = await window.fetchPolUsdPrice();
        console.log('POL/USD price:', polPrice);
        
        const prices = await window.getPrices();
        console.log('All prices:', prices);
        
        return { polPrice, prices };
    } catch (error) {
        console.error('Test price API error:', error);
        return { error: error.message };
    }
};

// تابع تست آمار قرارداد
window.testContractStats = async function() {
    try {
        console.log('=== Testing Contract Stats ===');
        
        const stats = await window.getContractStats();
        console.log('Contract stats:', stats);
        
        return stats;
    } catch (error) {
        console.error('Test contract stats error:', error);
        return { error: error.message };
    }
};

// تابع تست کامل
window.runFullTest = async function() {
    console.log('=== Running Full Test ===');
    
    const connection = await window.testConnection();
    const priceTest = await window.testPriceAPI();
    const statsTest = await window.testContractStats();
    
    console.log('=== Test Results ===');
    console.log('Connection:', connection);
    console.log('Price API:', priceTest);
    console.log('Contract Stats:', statsTest);
    
    return { connection, priceTest, statsTest };
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

// تابع تست و عیب‌یابی شبکه
window.testNetworkConnection = async function() {
    try {
        console.log('=== Testing Network Connection ===');
        
        const { contract, provider, address } = await window.connectWallet();
        
        // تست اتصال شبکه
        console.log('Testing network connection...');
        const network = await window.retryRpcOperation(() => provider.getNetwork(), 2);
        console.log('Network:', network);
        
        // تست موجودی کیف پول
        console.log('Testing wallet balance...');
        const balance = await window.retryRpcOperation(() => provider.getBalance(address), 2);
        console.log('Wallet balance:', ethers.formatEther(balance));
        
        // تست قرارداد
        console.log('Testing contract connection...');
        const totalSupply = await window.retryRpcOperation(() => contract.totalSupply(), 2);
        console.log('Contract total supply:', ethers.formatUnits(totalSupply, 18));
        
        // تست اطلاعات کاربر
        console.log('Testing user data...');
        const user = await window.retryRpcOperation(() => contract.users(address), 2);
        console.log('User data:', {
            activated: user.activated,
            index: user.index ? user.index.toString() : '0',
            binaryPoints: user.binaryPoints ? user.binaryPoints.toString() : '0'
        });
        
        return {
            success: true,
            network: network.name,
            chainId: network.chainId,
            balance: ethers.formatEther(balance),
            totalSupply: ethers.formatUnits(totalSupply, 18),
            userActivated: user.activated
        };
        
    } catch (error) {
        console.error('Network test failed:', error);
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
};

// تابع تست ثبت‌نام
window.testRegistration = async function() {
    try {
        console.log('=== Testing Registration ===');
        
        const { contract, address } = await window.connectWallet();
        
        // بررسی وضعیت ثبت‌نام
        const user = await window.retryRpcOperation(() => contract.users(address), 2);
        
        if (user.activated) {
            console.log('User is already registered and activated');
            return {
                registered: true,
                activated: true,
                message: 'کاربر قبلاً ثبت‌نام شده است'
            };
        }
        
        // بررسی قیمت ثبت‌نام
        const regPrice = await window.retryRpcOperation(() => contract.regprice(), 2);
        console.log('Registration price:', ethers.formatEther(regPrice));
        
        // بررسی موجودی کیف پول
        const { provider } = await window.connectWallet();
        const balance = await window.retryRpcOperation(() => provider.getBalance(address), 2);
        console.log('Wallet balance:', ethers.formatEther(balance));
        
        if (balance < regPrice) {
            return {
                registered: false,
                activated: false,
                canRegister: false,
                message: 'موجودی کافی برای ثبت‌نام نیست',
                required: ethers.formatEther(regPrice),
                available: ethers.formatEther(balance)
            };
        }
        
        return {
            registered: false,
            activated: false,
            canRegister: true,
            message: 'امکان ثبت‌نام وجود دارد',
            required: ethers.formatEther(regPrice),
            available: ethers.formatEther(balance)
        };
        
    } catch (error) {
        console.error('Registration test failed:', error);
        return {
            registered: false,
            activated: false,
            canRegister: false,
            error: error.message,
            code: error.code
        };
    }
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

