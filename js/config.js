// تنظیمات قرارداد LevelUp
const CONTRACT_ADDRESS = '0xe85b60496048d2723B829c9fB44C420cbbC4884a';
const CONTRACT_LOTARY = '0x0fC5025C764cE34df352757e82f7B5c4Df39A836';
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
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "winnersCount",
				"type": "uint256"
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
				"name": "amountLvl",
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
				"name": "amountLvl",
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
            // جلوگیری از درخواست‌های همزمان
            if (permissionRequestInProgress) {
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
                } else {
                    throw new Error('User did not approve connection');
                }
            } else {
                permissionRequestInProgress = true;
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
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
        
        const address = await signer.getAddress();
        
        const network = await provider.getNetwork();
        
        window.contractConfig = {
            ...window.contractConfig,
            provider: provider,
            signer: signer,
            contract: contract,
            address: address,
            initializeWeb3: initializeWeb3
        };
        
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
        return initializationPromise;
    }
    
    if (window.contractConfig && 
        window.contractConfig.provider && 
        window.contractConfig.signer && 
        window.contractConfig.contract) {
        return window.contractConfig;
    }
    
    isInitializing = true;
    initializationPromise = performWeb3Initialization();
    
    try {
        const result = await initializationPromise;
        window.initializeWeb3 = initializeWeb3;
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
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address && window.contractConfig.signer) {
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
                balanceProvider.getBalance(address),
                contract.balanceOf(address)
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
};

// تابع مرکزی دریافت آمار قرارداد
window.getContractStats = async function() {
    try {
        const { contract } = await window.connectWallet();
        
        // استفاده از retry mechanism برای عملیات‌های قرارداد
        const getStatsWithRetry = async () => {
            // دریافت آمار به صورت موازی با مدیریت خطا
            const [
                totalSupply,
                pointValue
            ] = await Promise.all([
                contract.totalSupply().catch(() => 0n),
                contract.getPointValue().catch(() => 0n)
            ]);
            
            // دریافت wallets به صورت جداگانه (متغیر state)
            let wallets = 0n;
            try {
                if (typeof contract.wallets === 'function') {
                    wallets = await contract.wallets();
                } else {
                    wallets = await contract.wallets;
                }
            } catch (e) {
                console.warn('Could not fetch wallets:', e);
                wallets = 0n;
            }
            
            // دریافت totalClaimableBinaryPoints به صورت جداگانه (متغیر state)
            let totalClaimableBinaryPoints = 0n;
            try {
                if (typeof contract.totalClaimableBinaryPoints === 'function') {
                    totalClaimableBinaryPoints = await contract.totalClaimableBinaryPoints();
                } else {
                    totalClaimableBinaryPoints = await contract.totalClaimableBinaryPoints;
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
        const [totalClaimableBinaryPoints] = await Promise.all([
            contract.totalClaimableBinaryPoints
        ]);
        updateElement('network-points', parseInt(totalClaimableBinaryPoints.toString()));
        updateElement('network-rewards', parseInt(totalClaimableBinaryPoints.toString()));
    } catch (error) {
        console.error('Error loading network stats:', error);
    }
}

// تابع برداشت پاداش‌های باینری
window.claimRewards = async function() {
    try {
        const { contract } = await window.connectWallet();
        
        const tx = await contract.claim();
        const receipt = await tx.wait();
        
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
        const tx = await contract.claimMonthlyReward();
        const receipt = await tx.wait();
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
        (Date.now() - window.cachedPolPrice.timestamp) < 60000) { // 1 دقیقه کش
        return window.cachedPolPrice.price;
    }

    try {
        // تلاش با API کوین‌گکو
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'LevelUp-DApp/1.0'
            },
            timeout: 5000
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data && data['matic-network'] && data['matic-network'].usd) {
                const price = data['matic-network'].usd;
                // ذخیره در کش
                window.cachedPolPrice = {
                    price: price,
                    timestamp: Date.now()
                };
                return price;
            }
        }
    } catch (e) {
        console.warn('CoinGecko API failed, trying alternative sources:', e);
    }

    // Fallback به API های جایگزین
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT');
        if (response.ok) {
            const data = await response.json();
            if (data && data.price) {
                const price = parseFloat(data.price);
                window.cachedPolPrice = {
                    price: price,
                    timestamp: Date.now()
                };
                return price;
            }
        }
    } catch (e) {
        console.warn('Binance API failed:', e);
    }

    // Fallback نهایی - قیمت ثابت
    const fallbackPrice = 0.85; // قیمت تقریبی MATIC
    window.cachedPolPrice = {
        price: fallbackPrice,
        timestamp: Date.now()
    };
    return fallbackPrice;
};

(async () => {
  try {
    const { contract, address } = await window.connectWallet();
    const user = await contract.users(address);
    const { contract: contractConfig, address: configAddress } = window.contractConfig;
    contractConfig.users(configAddress).then(u => console.log('User index:', u.index ? u.index.toString() : '0'));
    // تبدیل user.index به BigInt برای عملیات ریاضی و سپس به رشته برای نمایش
    const userIndex = user.index ? BigInt(user.index) : 0n;
    contract.indexToAddress((userIndex * 2n)).then(a => console.log('Left child:', a));
    contract.indexToAddress((userIndex * 2n) + 1n).then(a => console.log('Right child:', a));
  } catch (error) {
    console.log('Debug section error:', error.message);
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
    if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
        console.warn('RPC timeout - retrying...');
        return 'retry';
    }
    
    // اگر خطای rate limit بود
    if (error.code === -32005 || error.message.includes('rate limit')) {
        console.warn('RPC rate limit - waiting before retry...');
        return 'wait';
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
                // انتظار کوتاه قبل از retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                continue;
            } else if (errorType === 'wait' && i < maxRetries - 1) {
                // انتظار طولانی‌تر برای rate limit
                await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
                continue;
            } else {
                // خطای نهایی
                throw error;
            }
        }
    }
};

// تابع تست اتصال و قرارداد
window.testConnection = async function() {
    try {
        console.log('=== Testing Connection ===');
        
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
