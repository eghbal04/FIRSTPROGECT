// تنظیمات قرارداد LevelUp
const CONTRACT_ADDRESS = '0x05C7c026f56D28d85B2e2593B8aB2305e95552DD';
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "leftPoints",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "rightPoints",
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
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        
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
            console.log('Profile: user.totalPurchasedKind (raw):', user.totalPurchasedKind);
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
        let lvlPriceMatic = 0n;
        let polPriceUSD = 0;
        
        try {
            [lvlPriceMatic, polPriceUSD] = await Promise.all([
                contract.getTokenPrice(),
                window.fetchPolUsdPrice()
            ]);
            console.log('Profile: Prices received - LVL/MATIC:', lvlPriceMatic.toString(), 'POL/USD:', polPriceUSD);
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
        
        // دریافت قیمت LVL/MATIC از قرارداد و قیمت MATIC/USD از API
        const [lvlPriceMatic, polPrice] = await Promise.all([
            contract.getTokenPrice().catch(() => ethers.parseUnits("0.0012", 18)),
            window.fetchPolUsdPrice()
        ]);
        
        const lvlPriceMaticFormatted = ethers.formatUnits(lvlPriceMatic, 18);
        // قیمت LVL/USD = (LVL/MATIC) * (MATIC/USD)
        const lvlPriceUSD = parseFloat(lvlPriceMaticFormatted) * parseFloat(polPrice);
        
        return {
            lvlPriceUSD: lvlPriceUSD.toFixed(6),
            lvlPricePol: lvlPriceMaticFormatted,
            polPrice: polPrice.toFixed(6)
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
            totalSupply, binaryPool, 
            totalPoints, totalClaimableBinaryPoints, pointValue
        ] = await Promise.all([
            contract.totalSupply().catch(() => 0n),
            contract.binaryPool().catch(() => 0n),
            contract.totalPoints().catch(() => 0n),
            contract.totalClaimableBinaryPoints().catch(() => 0n),
            contract.getPointValue().catch(() => 0n)
        ]);
        // محاسبه circulatingSupply به صورت تقریبی
        let circulatingSupply = totalSupply;
        try {
            const contractBalance = await contract.balanceOf(contract.target);
            circulatingSupply = totalSupply - contractBalance;
        } catch (e) {
            console.warn('Could not calculate circulating supply, using total supply:', e);
            circulatingSupply = totalSupply;
        }
        return {
            totalSupply: ethers.formatUnits(totalSupply, 18),
            circulatingSupply: ethers.formatUnits(circulatingSupply, 18),
            binaryPool: ethers.formatEther(binaryPool),
            totalPoints: ethers.formatUnits(totalPoints, 18),
            totalClaimableBinaryPoints: ethers.formatUnits(totalClaimableBinaryPoints, 18),
            pointValue: ethers.formatUnits(pointValue, 18)
        };
    } catch (error) {
        console.error('Central: Error fetching contract stats:', error);
        return {
            totalSupply: "0",
            circulatingSupply: "0",
            binaryPool: "0",
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

// تابع بارگذاری آمار شبکه
async function loadNetworkStats(contract) {
    try {
        const [totalPoints, totalClaimableBinaryPoints] = await Promise.all([
            contract.totalPoints(),
            contract.totalClaimableBinaryPoints()
        ]);
        updateElement('network-points', parseInt(totalPoints.toString()));
        updateElement('network-rewards', parseInt(totalClaimableBinaryPoints.toString()));
    } catch (error) {
        console.error('Error loading network stats:', error);
    }
}

// تابع دریافت قیمت MATIC (POL) به دلار از API
window.fetchPolUsdPrice = async function() {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd';
    // 1. تلاش مستقیم (بدون پراکسی)
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data && data['matic-network'] && data['matic-network'].usd) {
                return data['matic-network'].usd;
            }
        }
    } catch (e) {
        // nothing
    }
    // 2. تلاش با پراکسی‌ها
    const proxies = [
        url => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
        url => 'https://thingproxy.freeboard.io/fetch/' + url,
        url => 'https://corsproxy.io/?' + encodeURIComponent(url),
        url => 'https://yacdn.org/proxy/' + url,
        url => 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent(url),
        url => 'https://proxy.cors.sh/' + url,
        url => 'https://api.proxycurl.com/?url=' + encodeURIComponent(url),
        url => 'https://bird.ioliu.cn/v1/?url=' + encodeURIComponent(url),
        url => 'https://jsonp.afeld.me/?url=' + encodeURIComponent(url),
        url => 'https://gall.dcinside.com/proxy/http/' + url
    ];
    for (const proxy of proxies) {
        try {
            const response = await fetch(proxy(url));
            if (response.ok) {
                const data = await response.json();
                if (data && data['matic-network'] && data['matic-network'].usd) {
                    return data['matic-network'].usd;
                }
            }
        } catch (e) {
            // nothing
        }
    }
    // 3. مقدار پیش‌فرض (fallback)
    return 0.5;
};
