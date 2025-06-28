// config.js
if (!window.contractConfig)
{
  window.contractConfig = 
  {
    // آدرس قرارداد بروزرسانی شده


      CONTRACT_ADDRESS:"0x7FD04bB7cC3326B35cDD12eD33e215A510e705A1",

      // ABI کامل قرارداد LevelUp
  	LEVELUP_ABI :[
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
			"inputs": [],
			"name": "buyTokens",
			"outputs": [],
			"stateMutability": "payable",
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
		}
	],
  
      // تنظیمات شبکه Polygon
      NETWORK_CONFIG: {
          chainId: '0x89',
          chainName: 'Polygon Mainnet',
          nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18
          },
          rpcUrls: [
              'https://polygon-rpc.com/',
              'https://rpc-mainnet.maticvigil.com/',
              'https://polygon-rpc.com/',
              'https://rpc-mainnet.matic.network/'
          ],
          blockExplorerUrls: ['https://polygonscan.com/']
      },
  
        // متغیرهای global
        provider: null,
        signer: null,
        contract: null,
        walletConnectProvider: null,
        isConnecting: false,
  
      // تابع اتصال به شبکه مناسب
      switchToPolygon: async function() {
          try {
              console.log('Attempting to switch to Polygon network...');
              
              // بررسی شبکه فعلی
              const provider = new ethers.BrowserProvider(window.ethereum);
              const network = await provider.getNetwork();
              console.log('Current network:', network.name, 'Chain ID:', network.chainId);
              
              // اگر در حال حاضر در Polygon هستیم، نیازی به تغییر نیست
              if (network.chainId === 137n) {
                  console.log('Already connected to Polygon network');
                  return true;
              }
              
              // تلاش برای تغییر شبکه
              await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: this.NETWORK_CONFIG.chainId }],
              });
              
              console.log('Successfully switched to Polygon network');
              return true;
              
          } catch (switchError) {
              console.warn('Switch network error:', switchError);
              
              // اگر شبکه وجود ندارد، آن را اضافه کن
              if (switchError.code === 4902) {
                  try {
                      console.log('Adding Polygon network to wallet...');
                      await window.ethereum.request({
                          method: 'wallet_addEthereumChain',
                          params: [this.NETWORK_CONFIG],
                      });
                      console.log('Successfully added Polygon network');
                      return true;
                  } catch (addError) {
                      console.error('خطا در افزودن شبکه Polygon:', addError);
                      throw new Error('Failed to add Polygon network to wallet');
                  }
              } else {
                  console.warn('Network switch failed, continuing with current network');
                  return false;
              }
          }
      },
  
      // راه‌اندازی اولیه
      initializeWeb3: async function() {
          try {
              // بررسی اینکه آیا قبلاً در حال اتصال هستیم
              if (this.isConnecting) {
                  console.log("Already connecting to wallet, please wait...");
                  // منتظر اتمام اتصال قبلی بمان
                  let waitCount = 0;
                  while (this.isConnecting && waitCount < 50) { // حداکثر 5 ثانیه
                      await new Promise(resolve => setTimeout(resolve, 100));
                      waitCount++;
                  }
                  if (this.isConnecting) {
                      console.log("Connection timeout, resetting...");
                      this.isConnecting = false;
                  }
              }
              
              // اگر قبلاً متصل هستیم، بررسی کنیم که آیا هنوز معتبر است
              if (this.signer && this.contract) {
                  try {
                      const address = await this.signer.getAddress();
                      if (address) {
                          console.log('Already connected to wallet:', address);
                          return true;
                      }
                  } catch (error) {
                      console.log('Previous connection invalid, reconnecting...');
                      this.signer = null;
                      this.contract = null;
                  }
              }
              
              this.isConnecting = true;
              
              if (!window.ethereum) {
                  this.isConnecting = false;
                  throw new Error('کیف پول یافت نشد');
              }

              // تلاش برای اتصال به شبکه Polygon
              try {
                  await this.switchToPolygon();
                  console.log('Successfully switched to Polygon network');
              } catch (networkError) {
                  console.warn('Failed to switch to Polygon network:', networkError);
                  // ادامه کار با شبکه فعلی
              }
              
              // ایجاد provider با fallback RPC URLs
              let provider;
              try {
                  provider = new ethers.BrowserProvider(window.ethereum);
                  console.log('Browser provider created successfully');
              } catch (providerError) {
                  console.error('Failed to create browser provider:', providerError);
                  throw new Error('Failed to create provider');
              }
              
              // اضافه کردن تأخیر برای جلوگیری از درخواست‌های همزمان
              await new Promise(resolve => setTimeout(resolve, 200));
              
              // دریافت signer
              let signer;
              try {
                  signer = await provider.getSigner();
                  console.log('Signer obtained successfully');
              } catch (signerError) {
                  console.error('Failed to get signer:', signerError);
                  throw new Error('Failed to get signer');
              }
              
              // ایجاد قرارداد
              let contract;
              try {
                  contract = new ethers.Contract(this.CONTRACT_ADDRESS, this.LEVELUP_ABI, signer);
                  console.log('Contract created successfully');
              } catch (contractError) {
                  console.error('Failed to create contract:', contractError);
                  throw new Error('Failed to create contract');
              }
              
              // بررسی اینکه آیا اتصال موفق بود
              let address;
              try {
                  address = await signer.getAddress();
                  if (!address) {
                      throw new Error('No wallet address');
                  }
                  console.log('Wallet address obtained:', address);
              } catch (addressError) {
                  console.error('Failed to get wallet address:', addressError);
                  throw new Error('Failed to get wallet address');
              }
              
              // بررسی شبکه
              try {
                  const network = await provider.getNetwork();
                  console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
                  
                  // بررسی اینکه آیا در شبکه Polygon هستیم
                  if (network.chainId !== 137n) {
                      console.warn('Not connected to Polygon network. Current chain ID:', network.chainId);
                      // تلاش برای تغییر شبکه
                      try {
                          await this.switchToPolygon();
                          console.log('Successfully switched to Polygon after connection');
                      } catch (switchError) {
                          console.warn('Failed to switch to Polygon after connection:', switchError);
                      }
                  }
              } catch (networkError) {
                  console.warn('Failed to get network info:', networkError);
              }
              
              // ذخیره اتصال
              this.provider = provider;
              this.signer = signer;
              this.contract = contract;
              
              console.log('Web3 initialized successfully');
              this.isConnecting = false;
              return true;
              
          } catch (error) {
              console.error('خطا در راه‌اندازی Web3:', error);
              this.isConnecting = false;
              
              // اگر خطای "Already processing" بود، بعد از 2 ثانیه دوباره تلاش کن
              if (error.message.includes('Already processing') || error.code === -32002) {
                  console.log('MetaMask busy, retrying in 2 seconds...');
                  setTimeout(() => {
                      this.initializeWeb3();
                  }, 2000);
                  return false;
              }
              
              throw error;
          }
      },
  
        // WalletConnect Configuration
      WALLETCONNECT_PROJECT_ID: "c4f79cc821944d9680842e34466bfbd9", // Project ID از WalletConnect
      WALLETCONNECT_METADATA: {
          name: "LevelUp Platform",
          description: "LevelUp Token Platform - پلتفرم توکن LevelUp",
          url: window.location.origin,
          icons: ["https://raw.githubusercontent.com/your-repo/levelup-platform/main/lvl.jpg"]
      },
      
      // تابع نمایش QR Code
      showQRCode: async function() {
          try {
              // ایجاد modal برای نمایش QR Code
              const modal = document.createElement('div');
              modal.id = 'qr-modal';
              modal.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.9);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  z-index: 10000;
                  backdrop-filter: blur(10px);
              `;

              const modalContent = document.createElement('div');
              modalContent.style.cssText = `
                  background: rgba(0, 0, 0, 0.95);
                  border: 2px solid #00ff88;
                  border-radius: 20px;
                  padding: 2rem;
                  text-align: center;
                  max-width: 400px;
                  width: 90%;
                  backdrop-filter: blur(20px);
                  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
              `;

              // عنوان
              const title = document.createElement('h3');
              title.textContent = 'اتصال با کیف پول';
              title.style.cssText = `
                  color: #00ff88;
                  margin-bottom: 1rem;
                  font-family: 'Nazanin', 'B Nazanin', 'BNazanin', Tahoma, Arial, sans-serif;
                  font-size: 1.2rem;
              `;

              // توضیحات
              const description = document.createElement('p');
              description.textContent = 'بارکد زیر را با کیف پول موبایل خود اسکن کنید';
              description.style.cssText = `
                  color: #ffffff;
                  margin-bottom: 1.5rem;
                  font-family: 'Nazanin', 'B Nazanin', 'BNazanin', Tahoma, Arial, sans-serif;
                  font-size: 0.9rem;
              `;

              // محل QR Code
              const qrContainer = document.createElement('div');
              qrContainer.id = 'qr-code-container';
              qrContainer.style.cssText = `
                  margin: 1rem 0;
                  display: flex;
                  justify-content: center;
              `;

              // دکمه بستن
              const closeBtn = document.createElement('button');
              closeBtn.textContent = 'بستن';
              closeBtn.style.cssText = `
                  background: linear-gradient(135deg, #00ff88, #00ccff);
                  color: #000000;
                  border: none;
                  border-radius: 12px;
                  padding: 0.8rem 1.5rem;
                  font-family: 'Nazanin', 'B Nazanin', 'BNazanin', Tahoma, Arial, sans-serif;
                  font-size: 0.9rem;
                  font-weight: 600;
                  cursor: pointer;
                  margin-top: 1rem;
                  transition: all 0.3s ease;
              `;

              closeBtn.onclick = () => {
                  document.body.removeChild(modal);
                  if (this.walletConnectProvider) {
                      this.disconnectWalletConnect();
                  }
              };

              // اضافه کردن عناصر به modal
              modalContent.appendChild(title);
              modalContent.appendChild(description);
              modalContent.appendChild(qrContainer);
              modalContent.appendChild(closeBtn);
              modal.appendChild(modalContent);
              document.body.appendChild(modal);

              // راه‌اندازی WalletConnect
              await this.initializeWalletConnect();

          } catch (error) {
              console.error('خطا در نمایش QR Code:', error);
              alert('خطا در نمایش بارکد: ' + error.message);
          }
      },

      // تابع راه‌اندازی WalletConnect
      initializeWalletConnect: async function() {
          try {
              const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
              
              this.walletConnectProvider = await EthereumProvider.init({
                  projectId: this.WALLETCONNECT_PROJECT_ID,
                  showQrModal: false, // خودمان QR Code را نمایش می‌دهیم
                  chains: [137], // Polygon chainId
                  optionalMethods: ["eth_sendTransaction", "personal_sign"],
                  metadata: this.WALLETCONNECT_METADATA
              });

              // گوش دادن به رویدادهای WalletConnect
              this.walletConnectProvider.on('display_uri', (uri) => {
                  this.generateQRCode(uri);
              });

              this.walletConnectProvider.on('connect', (connectInfo) => {
                  console.log('WalletConnect connected:', connectInfo);
                  this.onWalletConnectSuccess();
              });

              this.walletConnectProvider.on('disconnect', () => {
                  console.log('WalletConnect disconnected');
                  this.onWalletConnectDisconnect();
              });

              this.walletConnectProvider.on('session_event', (event) => {
                  console.log('WalletConnect session event:', event);
              });

              this.walletConnectProvider.on('session_update', (event) => {
                  console.log('WalletConnect session update:', event);
              });

              // فعال‌سازی WalletConnect
              await this.walletConnectProvider.enable();

          } catch (error) {
              console.error('خطا در راه‌اندازی WalletConnect:', error);
              throw error;
          }
      },

      // تابع تولید QR Code
      generateQRCode: function(uri) {
          try {
              // استفاده از QRCode.js برای تولید QR Code
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
              script.onload = () => {
                  const qrContainer = document.getElementById('qr-code-container');
                  if (qrContainer) {
                      qrContainer.innerHTML = '';
                      
                      QRCode.toCanvas(qrContainer, uri, {
                          width: 200,
                          height: 200,
                          margin: 2,
                          color: {
                              dark: '#00ff88',
                              light: '#000000'
                          }
                      }, (error) => {
                          if (error) {
                              console.error('خطا در تولید QR Code:', error);
                              qrContainer.innerHTML = '<p style="color: #ff4444;">خطا در تولید بارکد</p>';
                          }
                      });
                  }
              };
              document.head.appendChild(script);
          } catch (error) {
              console.error('خطا در تولید QR Code:', error);
          }
      },

      // تابع موفقیت اتصال WalletConnect
      onWalletConnectSuccess: async function() {
          try {
              // تنظیم provider و signer
              this.provider = new ethers.BrowserProvider(this.walletConnectProvider);
              this.signer = await this.provider.getSigner();
              this.contract = new ethers.Contract(
                  this.CONTRACT_ADDRESS, 
                  this.LEVELUP_ABI, 
                  this.signer
              );

              // بستن modal
              const modal = document.getElementById('qr-modal');
              if (modal) {
                  document.body.removeChild(modal);
              }

              // نمایش پیام موفقیت
              this.showConnectionStatus('اتصال موفق! کیف پول شما متصل شد.', 'success');

              // به‌روزرسانی UI
              if (typeof updateConnectionStatus === 'function') {
                  updateConnectionStatus(true);
              }

              // بارگذاری داده‌ها
              if (typeof loadDashboardData === 'function') {
                  await loadDashboardData();
              }

          } catch (error) {
              console.error('خطا در تنظیم اتصال WalletConnect:', error);
              this.showConnectionStatus('خطا در اتصال: ' + error.message, 'error');
          }
      },

      // تابع قطع اتصال WalletConnect
      onWalletConnectDisconnect: function() {
          this.provider = null;
          this.signer = null;
          this.contract = null;
          this.walletConnectProvider = null;

          // به‌روزرسانی UI
          if (typeof updateConnectionStatus === 'function') {
              updateConnectionStatus(false);
          }

          this.showConnectionStatus('اتصال قطع شد', 'error');
      },

      // تابع نمایش وضعیت اتصال
      showConnectionStatus: function(message, type = 'info') {
          const statusDiv = document.createElement('div');
          statusDiv.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 1rem 1.5rem;
              border-radius: 12px;
              color: #ffffff;
              font-family: 'Nazanin', 'B Nazanin', 'BNazanin', Tahoma, Arial, sans-serif;
              font-size: 0.9rem;
              z-index: 10001;
              max-width: 300px;
              word-wrap: break-word;
          `;

          switch (type) {
              case 'success':
                  statusDiv.style.background = 'rgba(0, 255, 136, 0.9)';
                  statusDiv.style.border = '1px solid #00ff88';
                  break;
              case 'error':
                  statusDiv.style.background = 'rgba(255, 0, 0, 0.9)';
                  statusDiv.style.border = '1px solid #ff4444';
                  break;
              default:
                  statusDiv.style.background = 'rgba(0, 204, 255, 0.9)';
                  statusDiv.style.border = '1px solid #00ccff';
          }

          statusDiv.textContent = message;
          document.body.appendChild(statusDiv);

          // حذف پیام بعد از 5 ثانیه
          setTimeout(() => {
              if (document.body.contains(statusDiv)) {
                  document.body.removeChild(statusDiv);
              }
          }, 5000);
      },

      // تابع قطع ارتباط WalletConnect
      disconnectWalletConnect: function() {
          if (this.walletConnectProvider) {
              this.walletConnectProvider.disconnect();
              this.walletConnectProvider = null;
          }
          this.provider = null;
          this.signer = null;
          this.contract = null;
      },

      // تابع تشخیص کیف پول‌های موجود
      detectAvailableWallets: function() {
          const wallets = {
              metamask: false,
              walletconnect: true // همیشه در دسترس است
          };
          
          // بررسی MetaMask
          if (window.ethereum) {
              wallets.metamask = true;
          }
          
          return wallets;
      },
      
      // تابع اتصال با انتخاب کیف پول
      connectWithWallet: async function(walletType = 'auto') {
          try {
              const availableWallets = this.detectAvailableWallets();
              
              if (walletType === 'auto') {
                  // اولویت با MetaMask
                  if (availableWallets.metamask) {
                      return await this.initializeWeb3();
                  } else if (availableWallets.walletconnect) {
                      return await this.showQRCode();
                  }
              } else if (walletType === 'metamask' && availableWallets.metamask) {
                  return await this.initializeWeb3();
              } else if (walletType === 'walletconnect' && availableWallets.walletconnect) {
                  return await this.showQRCode();
              }
              
              throw new Error('کیف پول مورد نظر در دسترس نیست');
          } catch (error) {
              console.error('خطا در اتصال کیف پول:', error);
              throw error;
          }
      }
};
}
