// تنظیمات قرارداد IAMPHOENIX

// Helper function for ethers.js compatibility
function formatUnits(value, decimals = 18) {
    if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
        return ethers.utils.formatUnits(value, decimals);
    } else if (typeof ethers.formatUnits !== 'undefined') {
        return ethers.formatUnits(value, decimals);
    } else {
        // Manual conversion
        return (parseFloat(value.toString()) / Math.pow(10, decimals)).toString();
    }
}

function formatEther(value) {
    if (typeof ethers.utils !== 'undefined' && ethers.utils.formatEther) {
        return ethers.utils.formatEther(value);
    } else if (typeof ethers.formatEther !== 'undefined') {
        return ethers.formatEther(value);
    } else {
        // Manual conversion
        return (parseFloat(value.toString()) / Math.pow(10, 18)).toString();
    }
}

const IAM_ADDRESS = '0x2D3923A5ba62B2bec13b9181B1E9AE0ea2C8118D';
window.IAM_ADDRESS = IAM_ADDRESS;

// Force clear any cached contract data
if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('contractAddress');
    localStorage.removeItem('contractConfig');
    localStorage.removeItem('cachedContractData');
}

// Force update contract configuration
window.forceContractUpdate = function() {
    console.log('🔄 Forcing contract update to new address:', IAM_ADDRESS);
    window.IAM_ADDRESS = IAM_ADDRESS;
    
    // Clear any existing contract config
    if (window.contractConfig) {
        window.contractConfig.IAM_ADDRESS = IAM_ADDRESS;
        window.contractConfig.contract = null; // Force recreation
    }
    
    // Clear localStorage cache
    if (typeof localStorage !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes('contract') || key.includes('cache')) {
                localStorage.removeItem(key);
            }
        });
    }
    
    console.log('✅ Contract configuration updated to new address');
};

// Auto-force contract update on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded, ensuring new contract address is used');
    window.forceContractUpdate();
});

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
				"name": "amountIAM",
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
const IAM_ABI =[
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
				"name": "amountIAM",
				"type": "uint256"
			}
		],
		"name": "PurchaseKind",
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
window.IAM_ABI = IAM_ABI;

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
		// بررسی وجود MetaMask - بهبود یافته
		if (typeof window === 'undefined' || !window.ethereum) {
			console.error('MetaMask not detected: window.ethereum is undefined');
			throw new Error('MetaMask is not installed. Please install MetaMask extension.');
		}
		
		let provider;
		if (typeof ethers.providers !== 'undefined' && ethers.providers.Web3Provider) {
			provider = new ethers.providers.Web3Provider(window.ethereum);
		} else if (typeof ethers.BrowserProvider !== 'undefined') {
			provider = new ethers.BrowserProvider(window.ethereum);
		} else {
			throw new Error('Ethers.js provider not available');
		}
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
		const contract = new ethers.Contract(IAM_ADDRESS, IAM_ABI, signer);
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
			provider: provider,
			signer: signer,
			contract: contract,
			address: address,
			initializeWeb3: initializeWeb3
		};

		// Cache the connection
		connectionCache = connectionData;

		return window.contractConfig;

	} catch (error) {
		console.error('خطا در راه‌اندازی Web3:', error);

		// Check if the error is related to MetaMask not being installed
		if (!window.ethereum) {
			const metamaskError = new Error('MetaMask is not installed. Please install MetaMask extension.');
			console.error('MetaMask not detected:', metamaskError);
			throw metamaskError;
		}

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
	IAM_ADDRESS: IAM_ADDRESS,
	IAM_ABI: IAM_ABI,
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
		// Early check for MetaMask
		if (typeof window === 'undefined' || !window.ethereum) {
			console.error('MetaMask not detected in connectWallet');
			throw new Error('MetaMask is not installed. Please install MetaMask extension.');
		}
		
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
				try {
					const result = await initializeWeb3();
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
				} catch (web3Error) {
					// Check if this is a MetaMask not installed error
					if (web3Error.message && web3Error.message.includes('MetaMask is not installed')) {
						console.error('MetaMask not installed error caught:', web3Error);
						throw web3Error; // Re-throw to be handled by outer catch
					}
					throw web3Error;
				}
			} catch (error) {
				lastError = error;
				console.error(`Central: Error connecting wallet (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
				
				// Check for MetaMask not installed error
				if (error.message && error.message.includes('MetaMask is not installed')) {
					console.error('MetaMask not installed - stopping retries');
					throw error; // Don't retry, just throw the error
				}
				
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
		
		// رفرش tree — فقط اگر کانتینر روی صفحه حاضر باشد
		const hasNetworkContainer = typeof document !== 'undefined' && document.getElementById('network-tree');
		if (hasNetworkContainer) {
			if (typeof window.renderSimpleBinaryTree === 'function') {
				await window.renderSimpleBinaryTree();
			} else if (typeof window.renderNetworkTree === 'function') {
				await window.renderNetworkTree();
			}
		}
		
		// رفرش پروفایل کاربر
		if (typeof window.loadUserProfile === 'function') {
			await window.loadUserProfile();
		}
		
		// رفرش موجودی‌های ترنسفر
		if (typeof window.updateTransferBalancesOnConnect === 'function') {
			await window.updateTransferBalancesOnConnect();
		}
		
		// Swap functionality moved to separate page
		
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
							console.log('User data on account change:', userData);
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

// تابع پاک کردن interval tree
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
			console.log('getUserProfile: Starting for address:', address);
			
			// بررسی cache برای جلوگیری از فراخوانی مکرر
			const cacheKey = `userProfile_${address}`;
			const cached = sessionStorage.getItem(cacheKey);
			if (cached) {
				const parsed = JSON.parse(cached);
				const cacheTime = parsed.timestamp || 0;
				// اگر کمتر از 30 ثانیه از آخرین درخواست گذشته، از cache استفاده کن
				if (Date.now() - cacheTime < 30000) {
					console.log('getUserProfile: Using cached user profile');
					return parsed.data;
				}
			}
			
			// دریافت اطلاعات کاربر از قرارداد
			let user = {
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

			// تلاش برای دریافت واقعی user از قرارداد
			try {
				console.log('getUserProfile: Attempting contract.users...');
				// ابتدا از تابع users استفاده کن
				const userData = await contract.users(address);
				console.log('getUserProfile: Raw userData from contract.users:', userData);
				console.log('getUserProfile: userData.activated:', userData?.activated);
				console.log('getUserProfile: userData.index:', userData?.index);
				
				if (userData && userData.activated) {
					user = userData;
					console.log('getUserProfile: User profile loaded from contract.users:', user);
				} else {
					console.log('getUserProfile: User not activated via contract.users, trying getIndexByAddress...');
					// اگر از users نتوانستیم، از getIndexByAddress استفاده کن
				const idx = await window.getIndexByAddress(contract, address);
					console.log('getUserProfile: Index from getIndexByAddress:', idx);
				if (idx && idx > 0n) {
					user.index = idx;
					user.activated = true;
						console.log('getUserProfile: User index found via getIndexByAddress:', idx);
					} else {
						console.log('getUserProfile: User is not registered or activated');
					}
				}
			} catch (error) {
				console.warn('getUserProfile: Error fetching user data, user may not be registered:', error?.message || error);
				// تلاش نهایی با getIndexByAddress
				try {
					console.log('getUserProfile: Fallback to getIndexByAddress...');
					const idx = await window.getIndexByAddress(contract, address);
					console.log('getUserProfile: Fallback index result:', idx);
					if (idx && idx > 0n) {
						user.index = idx;
						user.activated = true;
						console.log('getUserProfile: User index found via getIndexByAddress (fallback):', idx);
					}
				} catch (fallbackError) {
					console.warn('getUserProfile: getIndexByAddress also failed:', fallbackError?.message || fallbackError);
				}
			}
			
			console.log('getUserProfile: Final user object:', user);
			console.log('getUserProfile: Final user.activated:', user.activated);
			console.log('getUserProfile: Final user.index:', user.index);
			
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
				const lvlPriceFormatted = formatUnits(lvlPriceMatic, 18);
				lvlValueUSD = parseFloat(formatUnits(lvlBalance, 18)) * parseFloat(lvlPriceFormatted);
			}
			
			// محاسبه ارزش دلاری کل POL (POL همیشه 1 دلار است)
			let polValueUSD = 0;
			if (polBalance && polBalance > 0n) {
				polValueUSD = parseFloat(formatEther(polBalance));
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
						return formatUnits(val, decimals);
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
				if (typeof window.updateIAMIdDisplay === 'function') {
					window.updateIAMIdDisplay(user.index);
				}
			}
			
			const isActive = (user && typeof user.index !== 'undefined' && user.index !== null) ? (BigInt(user.index) > 0n) : false;
			const profile = {
				address: address,
				referrer: referrer,
				activated: isActive,
				binaryPoints: user.binaryPoints ? user.binaryPoints.toString() : '0',
				binaryPointCap: user.binaryPointCap ? user.binaryPointCap.toString() : '0',
				binaryPointsClaimed: user.binaryPointsClaimed ? user.binaryPointsClaimed.toString() : '0',
				totalPurchasedMATIC: formatEther(user.totalPurchasedMATIC || 0n),
				totalPurchasedKind: user.totalPurchasedKind ? user.totalPurchasedKind.toString() : '0',
				polBalance: formatEther(polBalance || 0n),
				maticBalance: formatEther(polBalance || 0n),
				lvlBalance: formatUnits(lvlBalance || 0n, 18),
				polValueUSD: safeFormat(polValueUSD, 8),
				lvlValueUSD: safeFormat(lvlValueUSD, 8),
				daiBalance: daiBalance,
				registered: isActive,
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

			let IAMPriceUSD = null;
			if (contract && typeof contract.getTokenPrice === 'function') {
				try {
					const price = await contract.getTokenPrice();
					IAMPriceUSD = window.formatTokenPrice ? window.formatTokenPrice(price) : formatUnits(price, 18);
				} catch (e) {
					console.error('Error getting token price:', e);
				}
			}
			return { IAMPriceUSD };
		} catch (error) {
			console.error('Error in getPrices:', error);
			return { IAMPriceUSD: null };
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
			totalSupply: formatUnits(totalSupply, 18),
			circulatingSupply: formatUnits(circulatingSupply, 18),
			binaryPool: formatUnits(binaryPool, 18),
			totalPoints: totalClaimableBinaryPoints ? formatUnits(totalClaimableBinaryPoints, 18) : '0',
			totalClaimableBinaryPoints: totalClaimableBinaryPoints ? formatUnits(totalClaimableBinaryPoints, 18) : '0',
			pointValue: formatUnits(pointValue, 18),
			rewardPool: formatEther(contractBalance), // استخر پاداش = موجودی POL قرارداد (نه توکن)
			contractTokenBalance: formatUnits(contractTokenBalance, 18) // موجودی توکن قرارداد
			
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
		console.log(`${index + 1}. ${entry.price} IAM - ${date}`);
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
		console.log(`💎 Latest Point Price: ${lastPoint.price} IAM`);
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
	
	// Handle MetaMask method not available errors
	if (error.code === -32601 || (error.message && error.message.includes('does not exist / is not available'))) {
		console.warn('MetaMask method not available - ignoring...');
		return null;
	}
	
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

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
	const error = event.reason;
	
	// Handle MetaMask method not available errors
	if (error && error.code === -32601 && error.message && error.message.includes('does not exist / is not available')) {
		console.warn('Caught unhandled MetaMask method error - ignoring:', error.message);
		event.preventDefault(); // Prevent the error from being logged
		return;
	}
	
	// Handle other MetaMask RPC errors
	if (error && error.code && (error.code === -32601 || error.code === -32602 || error.code === -32603)) {
		console.warn('Caught unhandled RPC error - handling gracefully:', error.message);
		event.preventDefault();
		return;
	}
	
	// For other errors, let them through
	console.warn('Unhandled promise rejection:', error);
});

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

	const totalSupplyNum = Number(formatUnits(totalSupply, 18));
	const contractBalanceNum = Number(formatUnits(contractBalance, 18));
			const tokenPriceNum = Number(formatUnits(tokenPrice, 18)); // قیمت با 18 رقم اعشار (DAI)

	const elTotalSupply = document.getElementById('total-supply');
	if (elTotalSupply) elTotalSupply.innerText = totalSupplyNum.toLocaleString('en-US', {maximumFractionDigits: 4}); // حذف پسوند IAM
	const elContractBalance = document.getElementById('contract-balance');
	if (elContractBalance) elContractBalance.innerText = contractBalanceNum.toLocaleString('en-US', {maximumFractionDigits: 4}); // حذف پسوند IAM
	document.getElementById('supply-diff').innerText = (totalSupplyNum - contractBalanceNum).toLocaleString('en-US', {maximumFractionDigits: 4}); // حذف پسوند IAM
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
	// عدم نمایش "waiting..." در بروزرسانی‌های عادی

	// TOTAL SUPPLY (circulating supply)
	try {
	  console.log('📊 Fetching total supply...');
	  
	  // افزایش timeout از ۵ ثانیه به ۷ ثانیه
	  const totalSupplyPromise = contract.totalSupply();
	  const timeoutPromise = new Promise((_, reject) => 
		setTimeout(() => reject(new Error('Total supply fetch timeout')), 7000)
	  );
	  
	  const totalSupply = await Promise.race([totalSupplyPromise, timeoutPromise]);
	  const formattedSupply = parseFloat(formatUnits(totalSupply, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
	  safeUpdate('circulating-supply', formattedSupply); // حذف پسوند IAM
	  console.log('✅ Total supply updated:', formattedSupply);
	  
	  // محاسبه معادل DAI برای کل عرضه
	  try {
		const tokenPrice = await contract.getTokenPrice();
		if (tokenPrice) {
		  const tokenPriceNum = parseFloat(formatUnits(tokenPrice, 18));
		  const supplyNum = parseFloat(formatUnits(totalSupply, 18));
		  const daiEquivalent = supplyNum * tokenPriceNum;
		  const daiFormatted = daiEquivalent.toLocaleString('en-US', {maximumFractionDigits: 2});
		  safeUpdate('circulating-supply-dai', daiFormatted);
		  console.log('✅ Total supply DAI equivalent updated:', daiFormatted);
		} else {
		  safeUpdate('circulating-supply-dai', '-');
		}
	  } catch (daiError) {
		console.error('❌ Error calculating total supply DAI equivalent:', daiError);
		safeUpdate('circulating-supply-dai', '-');
	  }

	} catch (e) {
	  console.error('❌ Error fetching total supply:', e);
	  console.error('❌ Error details:', {
		message: e.message,
		code: e.code,
		stack: e.stack
	  });
	  safeUpdate('circulating-supply', '-');
	  safeUpdate('circulating-supply-dai', '-');
	}

	// TOTAL POINTS
	try {
	  console.log('🎯 Fetching total points...');
	  const totalPoints = await contract.totalClaimablePoints();
	  // استفاده از formatUnits برای تبدیل صحیح BigInt به عدد
	  const formattedPoints = parseInt(formatUnits(totalPoints, 0)).toLocaleString('en-US');
	  safeUpdate('total-points', formattedPoints);
	  console.log('✅ Total points updated:', formattedPoints);

	} catch (e) {
	  console.error('❌ Error fetching total points:', e);
	  safeUpdate('total-points', 'Error');
	}

	// IAM BALANCE (contract's own token balance)
	try {
	  console.log('🏦 Fetching contract token balance...');
	  const contractTokenBalance = await contract.balanceOf(contract.target);
	  const formattedBalance = parseFloat(formatUnits(contractTokenBalance, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
	  safeUpdate('contract-token-balance', formattedBalance); // حذف پسوند IAM
	  console.log('✅ Contract token balance updated:', formattedBalance);
	  
	  // محاسبه معادل DAI برای موجودی قرارداد
	  try {
		const tokenPrice = await contract.getTokenPrice();
		if (tokenPrice) {
		  const tokenPriceNum = parseFloat(formatUnits(tokenPrice, 18));
		  const balanceNum = parseFloat(formatUnits(contractTokenBalance, 18));
		  const daiEquivalent = balanceNum * tokenPriceNum;
		  const daiFormatted = daiEquivalent.toLocaleString('en-US', {maximumFractionDigits: 2});
		  safeUpdate('contract-token-balance-dai', daiFormatted);
		  console.log('✅ Contract token balance DAI equivalent updated:', daiFormatted);
		} else {
		  safeUpdate('contract-token-balance-dai', '-');
		}
	  } catch (daiError) {
		console.error('❌ Error calculating contract token balance DAI equivalent:', daiError);
		safeUpdate('contract-token-balance-dai', '-');
	  }

	} catch (e) {
	  console.error('❌ Error fetching contract token balance:', e);
	  safeUpdate('contract-token-balance', 'Error');
	  safeUpdate('contract-token-balance-dai', '-');
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
	  
	  const formattedCashback = parseFloat(formatUnits(cashback, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
	  safeUpdate('dashboard-cashback-value', formattedCashback); // حذف پسوند IAM
	  console.log('✅ Cashback updated:', formattedCashback);
	  
	  // محاسبه معادل DAI برای صندوق کمک
	  try {
		const tokenPrice = await contract.getTokenPrice();
		if (tokenPrice) {
		  const tokenPriceNum = parseFloat(formatUnits(tokenPrice, 18));
		  const cashbackNum = parseFloat(formatUnits(cashback, 18));
		  const daiEquivalent = cashbackNum * tokenPriceNum;
		  const daiFormatted = daiEquivalent.toLocaleString('en-US', {maximumFractionDigits: 2});
		  safeUpdate('dashboard-cashback-value-dai', daiFormatted);
		  console.log('✅ Cashback DAI equivalent updated:', daiFormatted);
		} else {
		  safeUpdate('dashboard-cashback-value-dai', '-');
		}
	  } catch (daiError) {
		console.error('❌ Error calculating cashback DAI equivalent:', daiError);
		safeUpdate('dashboard-cashback-value-dai', '-');
	  }

	} catch (e) {
	  console.error('❌ Error fetching cashback:', e);
	  safeUpdate('dashboard-cashback-value', 'N/A');
	  safeUpdate('dashboard-cashback-value-dai', '-');
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
  const formattedDai = parseFloat(formatUnits(daiBalance, 18)).toLocaleString('en-US', {maximumFractionDigits: 2});
  safeUpdate('dashboard-dai-balance', formattedDai);
  console.log('✅ DAI contract balance updated:', formattedDai);

	} catch (e) {
	  console.error('❌ Error fetching DAI balance:', e);
	  safeUpdate('dashboard-dai-balance', 'N/A');
	}

	// Update last update timestamp
	const now = new Date();
	const timeString = now.toLocaleTimeString('en-US', { 
	  hour: '2-digit', 
	  minute: '2-digit', 
	  second: '2-digit' 
	});
	safeUpdate('blockchain-last-update', timeString);

	// POINT VALUE (ارزش هر پوینت)
	try {
	  console.log('💎 Fetching point value...');
	  const pointValue = await contract.getPointValue();
	  const pointValueNum = parseFloat(formatUnits(pointValue, 18));
	  const formattedPointValue = pointValueNum.toLocaleString('en-US', {maximumFractionDigits: 6});
	  safeUpdate('dashboard-point-value', formattedPointValue); // حذف پسوند IAM
	  console.log('✅ Point value updated:', formattedPointValue);
	  
	  // محاسبه معادل DAI برای ارزش هر پوینت
	  try {
		const tokenPrice = await contract.getTokenPrice();
		if (tokenPrice) {
		  const tokenPriceNum = parseFloat(formatUnits(tokenPrice, 18));
		  const daiEquivalent = pointValueNum * tokenPriceNum;
		  const daiFormatted = daiEquivalent.toLocaleString('en-US', {maximumFractionDigits: 2});
		  safeUpdate('dashboard-point-value-dai', daiFormatted);
		  console.log('✅ Point value DAI equivalent updated:', daiFormatted);
		} else {
		  safeUpdate('dashboard-point-value-dai', '-');
		}
	  } catch (daiError) {
		console.error('❌ Error calculating point value DAI equivalent:', daiError);
		safeUpdate('dashboard-point-value-dai', '-');
	  }
	  
	  // Save point price to history
	  if (window.priceHistoryManager) {
		await window.priceHistoryManager.addPointPrice(pointValueNum);
		console.log('📊 Point price saved to history');
	  }
	} catch (e) {
	  console.error('❌ Error fetching point value:', e);
	  safeUpdate('dashboard-point-value', 'Error');
	  safeUpdate('dashboard-point-value-dai', '-');
	}

	// TOKEN PRICE (قیمت توکن IAM)
	try {
	  console.log('💲 Fetching token price...');
	  const tokenPrice = await contract.getTokenPrice();
	  const tokenPriceNum = parseFloat(formatUnits(tokenPrice, 18));
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
	  const formattedRegPrice = parseFloat(formatUnits(registrationPrice, 18)).toLocaleString('en-US', {maximumFractionDigits: 0});
	  safeUpdate('dashboard-registration-price', formattedRegPrice); // حذف پسوند IAM
	  console.log('✅ Registration price updated:', formattedRegPrice);

	  // محاسبه معادل DAI
	  try {
		const tokenPrice = await contract.getTokenPrice();
		if (tokenPrice) {
		  const tokenPriceNum = parseFloat(formatUnits(tokenPrice, 18));
		  const regPriceNum = parseFloat(formatUnits(registrationPrice, 18));
		  const daiEquivalent = regPriceNum * tokenPriceNum;
		  const daiFormatted = daiEquivalent.toLocaleString('en-US', {maximumFractionDigits: 2});
		  safeUpdate('dashboard-registration-price-dai', daiFormatted);
		  console.log('✅ Registration price DAI equivalent updated:', daiFormatted);
		} else {
		  safeUpdate('dashboard-registration-price-dai', '-');
		}
	  } catch (daiError) {
		console.error('❌ Error calculating DAI equivalent:', daiError);
		safeUpdate('dashboard-registration-price-dai', '-');
	  }
	} catch (e) {
	  console.error('❌ Error fetching registration price:', e);
	  safeUpdate('dashboard-registration-price', 'Error');
	  safeUpdate('dashboard-registration-price-dai', '-');
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
		if (!prices || !prices.IAMPriceUSD || parseFloat(prices.IAMPriceUSD) <= 0) {
			if (elChartLvlUsd) elChartLvlUsd.textContent = 'در حال دریافت...';
			return;
		}
		if (elChartLvlUsd) elChartLvlUsd.textContent = prices.IAMPriceUSD;
		// ... سایر المنت‌ها
	} catch (e) {
		if (elChartLvlUsd) elChartLvlUsd.textContent = 'در حال دریافت...';
	}
}

// Returns the DAI balance of the main contract (IAM_ADDRESS) as a string in DAI units (18 decimals)
async function getContractDAIBalance() {
  if (typeof ethers === 'undefined') throw new Error('ethers.js not loaded');
  const provider = (window.contractConfig && window.contractConfig.contract && window.contractConfig.contract.provider)
	? window.contractConfig.contract.provider
	: (window.contractConfig && window.contractConfig.provider)
	  ? window.contractConfig.provider
	  : (window.ethereum ? (typeof ethers.providers !== 'undefined' && ethers.providers.Web3Provider ? new ethers.providers.Web3Provider(window.ethereum) : new ethers.BrowserProvider(window.ethereum)) : null);
  if (!provider) throw new Error('No provider');
  const daiContract = new ethers.Contract(DAI_ADDRESS, DAI_ABI, provider);
  const balanceRaw = await daiContract.balanceOf(IAM_ADDRESS);
  return formatUnits(balanceRaw, 18); // DAI has 18 decimals
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
	  : (window.ethereum ? (typeof ethers.providers !== 'undefined' && ethers.providers.Web3Provider ? new ethers.providers.Web3Provider(window.ethereum) : new ethers.BrowserProvider(window.ethereum)) : null);
  if (!provider) throw new Error('No provider');
  const contract = new ethers.Contract(IAM_ADDRESS, IAM_ABI, provider);
  const pointsRaw = await contract.totalClaimablePoints();
  return pointsRaw; // BigInt or string
}
// Returns the integer value (no decimals)
async function getTotalClaimableBinaryPointsInteger() {
  const pointsRaw = await getTotalClaimableBinaryPoints();
  // استفاده از formatUnits برای تبدیل صحیح BigInt به عدد
  return parseInt(formatUnits(pointsRaw, 0)).toString();
}
// ... existing code ...



// ... existing code ...
// Returns the IAM token balance of the contract using balanceOf(IAM_ADDRESS)
async function getContractTokenBalance() {
  if (typeof ethers === 'undefined') throw new Error('ethers.js not loaded');
  const provider = (window.contractConfig && window.contractConfig.contract && window.contractConfig.contract.provider)
	? window.contractConfig.contract.provider
	: (window.contractConfig && window.contractConfig.provider)
	  ? window.contractConfig.provider
	  : (window.ethereum ? (typeof ethers.providers !== 'undefined' && ethers.providers.Web3Provider ? new ethers.providers.Web3Provider(window.ethereum) : new ethers.BrowserProvider(window.ethereum)) : null);
  if (!provider) throw new Error('No provider');
  const contract = new ethers.Contract(IAM_ADDRESS, IAM_ABI, provider);
  const tokenRaw = await contract.balanceOf(IAM_ADDRESS);
  return formatUnits(tokenRaw, 18); // returns as string, e.g. '123.456789012345678901'
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
		: (window.ethereum ? (typeof ethers.providers !== 'undefined' && ethers.providers.Web3Provider ? new ethers.providers.Web3Provider(window.ethereum) : new ethers.BrowserProvider(window.ethereum)) : null);
	if (!provider) throw new Error('No provider');
	const contract = new ethers.Contract(IAM_ADDRESS, IAM_ABI, provider);
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
	  const pointValueNum = parseFloat(formatUnits(pointValue, 18));
	  const pointValueFormatted = pointValueNum < 0.000001 ? pointValueNum.toExponential(6) : pointValueNum.toFixed(2);
	  const el2 = document.getElementById('point-value');
	  if (el2) el2.textContent = pointValueFormatted; // حذف پسوند IAM
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
window.generateIAMId = function(index) {
	if (!index || index === 0) return '0';
	
	// نمایش دقیق همان مقدار کنترکت بدون هیچ تغییری
	return index.toString();
};

// تابع نمایش ID در گوشه بالا سمت راست
window.displayIAMIdInCorner = function(index) {
	// حذف ID قبلی اگر وجود دارد
	const existingId = document.getElementById('IAM-id-corner');
	if (existingId) existingId.remove();
	
	if (!index || index === 0) return;
	
	const IAMId = window.generateIAMId(index);
	const isActive = (typeof index !== 'undefined' && index !== null && BigInt(index) > 0n);
	
	// ایجاد عنصر ID
	const idElement = document.createElement('div');
	idElement.id = 'IAM-id-corner';
	idElement.textContent = IAMId;
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
		navigator.clipboard.writeText(IAMId);
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
window.updateIAMIdDisplay = function(index) {
	const IAMId = window.generateIAMId(index);
	
	// به‌روزرسانی در پروفایل
	const profileIndexEl = document.getElementById('profile-index');
	if (profileIndexEl) {
		profileIndexEl.textContent = IAMId;
	}
	
	// به‌روزرسانی در داشبورد
	const dashboardIndexEl = document.getElementById('dashboard-user-index');
	if (dashboardIndexEl) {
		dashboardIndexEl.textContent = IAMId;
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
			dashboardUserStatus.textContent = isActive ? 'فعال' : 'غیرفعال';
			dashboardUserStatus.style.color = isActive ? '#00ff88' : '#ffa000';
		}
	}
	
	// به‌روزرسانی در شبکه
	const networkIndexEl = document.getElementById('network-user-index');
	if (networkIndexEl) {
		networkIndexEl.textContent = IAMId;
	}
	
	// نمایش در گوشه
	window.displayIAMIdInCorner(index);
};

// Helper: دریافت ایندکس از روی آدرس با استفاده از توابع موجود در ABI
window.getIndexByAddress = async function(contract, address) {
    try {
        if (!contract || !address) return 0n;
        // ترتیب تلاش: addressToIndex → getUserIndex → indexOf → users(address).index
        if (typeof contract.addressToIndex === 'function') {
            const idx = await window.retryRpcOperation(() => contract.addressToIndex(address), 2).catch(()=>null);
            if (idx != null) return BigInt(idx);
        }
        if (typeof contract.getUserIndex === 'function') {
            const idx = await window.retryRpcOperation(() => contract.getUserIndex(address), 2).catch(()=>null);
            if (idx != null) return BigInt(idx);
        }
        if (typeof contract.indexOf === 'function') {
            const idx = await window.retryRpcOperation(() => contract.indexOf(address), 2).catch(()=>null);
            if (idx != null) return BigInt(idx);
        }
        if (typeof contract.users === 'function') {
            const u = await window.retryRpcOperation(() => contract.users(address), 2).catch(()=>null);
            if (u && typeof u.index !== 'undefined' && u.index !== null) return BigInt(u.index);
        }
    } catch {}
    return 0n;
};

// Helper: دریافت آدرس از روی ایندکس
window.getAddressByIndex = async function(contract, index) {
    try {
        if (!contract || index == null) return null;
        
        // تبدیل ایندکس به BigInt
        const indexBigInt = BigInt(index);
        
        // استفاده از indexToAddress اگر موجود باشد
        if (typeof contract.indexToAddress === 'function') {
            const address = await window.retryRpcOperation(() => contract.indexToAddress(indexBigInt), 2).catch(() => null);
            if (address && address !== '0x0000000000000000000000000000000000000000') {
                return address;
            }
        }
        
        // تلاش با سایر توابع ممکن
        if (typeof contract.getAddressByIndex === 'function') {
            const address = await window.retryRpcOperation(() => contract.getAddressByIndex(indexBigInt), 2).catch(() => null);
            if (address && address !== '0x0000000000000000000000000000000000000000') {
                return address;
            }
        }
        
        console.warn('⚠️ No indexToAddress function found in contract');
        return null;
    } catch (error) {
        console.error('❌ Error in getAddressByIndex:', error);
        return null;
    }
};

// تابع تطبیق دقیق ایندکس و آدرس
window.validateIndexAddressMatch = async function(contract, index, expectedAddress) {
    try {
        console.log(`🔍 Validating index ${index} matches address ${expectedAddress}`);
        
        // دریافت آدرس از روی ایندکس
        const actualAddress = await window.getAddressByIndex(contract, index);
        console.log(`📍 Address from index ${index}:`, actualAddress);
        
        if (!actualAddress) {
            console.error('❌ Could not get address for index:', index);
            return false;
        }
        
        // مقایسه آدرس‌ها (case-insensitive)
        const match = actualAddress.toLowerCase() === expectedAddress.toLowerCase();
        
        if (match) {
            console.log(`✅ Index ${index} matches address ${expectedAddress}`);
        } else {
            console.log(`❌ Index ${index} does NOT match address ${expectedAddress}`);
            console.log(`   Expected: ${expectedAddress}`);
            console.log(`   Actual:   ${actualAddress}`);
        }
        
        return match;
    } catch (error) {
        console.error('❌ Error validating index-address match:', error);
        return false;
    }
};

// تابع ثبت نام با تطبیق دقیق ایندکس و آدرس
window.registerWithIndexValidation = async function(contract, userAddress, targetIndex, referrerAddress = null) {
    try {
        console.log(`🚀 Starting registration with index validation...`);
        console.log(`   User Address: ${userAddress}`);
        console.log(`   Target Index: ${targetIndex}`);
        console.log(`   Referrer: ${referrerAddress || 'None'}`);
        
        // مرحله 1: بررسی اینکه آیا ایندکس مورد نظر خالی است
        const existingAddress = await window.getAddressByIndex(contract, targetIndex);
        
        if (existingAddress && existingAddress !== '0x0000000000000000000000000000000000000000') {
            console.error(`❌ Index ${targetIndex} is already occupied by ${existingAddress}`);
            throw new Error(`ایندکس ${targetIndex} قبلاً توسط آدرس دیگری اشغال شده است.`);
        }
        
        console.log(`✅ Index ${targetIndex} is available`);
        
        // مرحله 2: بررسی اینکه آیا کاربر قبلاً ثبت نام کرده
        const currentIndex = await window.getIndexByAddress(contract, userAddress);
        
        if (currentIndex && currentIndex > 0n) {
            console.error(`❌ User ${userAddress} is already registered with index ${currentIndex}`);
            throw new Error(`شما قبلاً با ایندکس ${currentIndex} ثبت نام کرده‌اید.`);
        }
        
        console.log(`✅ User ${userAddress} is not registered yet`);
        
        // مرحله 3: انجام ثبت نام
        console.log(`📝 Performing registration...`);
        
        let tx;
        if (referrerAddress && referrerAddress !== '0x0000000000000000000000000000000000000000') {
            // ثبت نام با referrer
            console.log(`📋 Registering with referrer: ${referrerAddress}`);
            
            // بررسی صحت referrer
            const referrerIndex = await window.getIndexByAddress(contract, referrerAddress);
            if (!referrerIndex || referrerIndex === 0n) {
                console.warn(`⚠️ Invalid referrer ${referrerAddress}, proceeding without referrer`);
                tx = await contract.register();
            } else {
                console.log(`✅ Valid referrer found with index: ${referrerIndex}`);
                tx = await contract.registerWithReferrer(referrerAddress);
            }
        } else {
            // ثبت نام بدون referrer
            console.log(`📋 Registering without referrer`);
            tx = await contract.register();
        }
        
        console.log(`⏳ Transaction submitted: ${tx.hash}`);
        
        // انتظار برای تأیید تراکنش
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
        
        // مرحله 4: تأیید نهایی - بررسی اینکه ثبت نام با ایندکس درست انجام شده
        console.log(`🔍 Validating final registration...`);
        
        // کمی صبر کنیم تا blockchain update شود
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const finalIndex = await window.getIndexByAddress(contract, userAddress);
        const finalAddress = await window.getAddressByIndex(contract, finalIndex);
        
        console.log(`📊 Final validation results:`);
        console.log(`   User Address: ${userAddress}`);
        console.log(`   Assigned Index: ${finalIndex}`);
        console.log(`   Address from Index: ${finalAddress}`);
        
        if (finalIndex == targetIndex) {
            console.log(`🎉 SUCCESS: User registered with correct index ${targetIndex}`);
            return {
                success: true,
                index: finalIndex,
                address: userAddress,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                message: `ثبت نام با موفقیت انجام شد! ایندکس شما: ${finalIndex}`
            };
        } else {
            console.warn(`⚠️ Registration successful but index mismatch:`);
            console.warn(`   Expected: ${targetIndex}`);
            console.warn(`   Actual: ${finalIndex}`);
            return {
                success: true,
                index: finalIndex,
                address: userAddress,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                message: `ثبت نام انجام شد اما ایندکس متفاوت است. ایندکس واقعی: ${finalIndex}`
            };
        }
        
    } catch (error) {
        console.error('❌ Error in registerWithIndexValidation:', error);
        
        // پیام‌های خطای کاربرپسند
        let userMessage = 'خطا در ثبت نام: ';
        if (error.message.includes('already occupied')) {
            userMessage += 'ایندکس مورد نظر قبلاً اشغال شده است.';
        } else if (error.message.includes('already registered')) {
            userMessage += 'شما قبلاً ثبت نام کرده‌اید.';
        } else if (error.message.includes('insufficient')) {
            userMessage += 'موجودی کافی ندارید.';
        } else if (error.message.includes('user rejected')) {
            userMessage += 'تراکنش توسط کاربر لغو شد.';
        } else {
            userMessage += error.message;
        }
        
        return {
            success: false,
            error: error.message,
            message: userMessage
        };
    }
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
		TREE_LOADING: "waiting tree...",
		TREE_ERROR: "خطا در بارگذاری tree.",
		NETWORK_STATS_LOADING: "waiting آمار شبکه...",
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
		const tx = await contract.registerAndActivate(referrerAddress, referrerAddress, newUserAddress, { gasLimit: 500000 });
		
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
window.tokenAddress = IAM_ADDRESS;
window.tokenAbi = IAM_ABI;

// ... existing code ...
window.DAI_ADDRESS = DAI_ADDRESS;
window.DAI_ABI = DAI_ABI;
window.IAM_ADDRESS = IAM_ADDRESS;
window.CONTRACT_ABI = IAM_ABI;

// تابع دریافت ده کاربر برتر بر اساس لایک واقعی
window.getTopLikedUsers = async function(limit = 10) {
  try {
    console.log('🔍 شروع جستجوی کاربران با لایک واقعی...');
    
    if (!window.contractConfig || !window.contractConfig.contract) {
      await window.connectWallet();
    }
    const contract = window.contractConfig.contract;
    
    if (!contract) {
      console.error('قرارداد متصل نیست');
      return [];
    }

    const topUsers = [];
    let processedCount = 0;
    
    // جستجو در کاربران فعال برای یافتن برترین‌ها
    for (let i = 1; i <= 200; i++) { // افزایش محدوده برای یافتن کاربران بیشتر
      try {
        const address = await contract.indexToAddress(i);
        
        // بررسی اینکه آیا آدرس معتبر است
        if (address && address !== '0x0000000000000000000000000000000000000000') {
          try {
            // دریافت اطلاعات کاربر
            const userData = await contract.users(address);
            
            // بررسی اینکه آیا کاربر فعال است
            if (userData && userData.activated) {
              try {
                // دریافت تعداد لایک‌های کاربر
                const likeCount = await contract.likeCount(address);
                
                if (likeCount && BigInt(likeCount) > 0n) {
                  topUsers.push({
                    index: i,
                    address: address,
                    likeCount: Number(likeCount),
                    userData: userData
                  });
                  console.log(`✅ کاربر ${i} با ${Number(likeCount)} لایک یافت شد`);
                }
              } catch (e) {
                // اگر تابع likeCount موجود نباشد، ادامه بده
                console.log(`⚠️ تابع likeCount برای ایندکس ${i} موجود نیست`);
              }
            }
          } catch (e) {
            // اگر اطلاعات کاربر قابل دریافت نباشد، ادامه بده
            continue;
          }
        }
        
        processedCount++;
        if (processedCount % 20 === 0) {
          console.log(`📊 ${processedCount} ایندکس پردازش شد، ${topUsers.length} کاربر با لایک یافت شد`);
        }
        
      } catch (e) {
        // اگر ایندکس وجود نداشته باشد، ادامه بده
        continue;
      }
    }
    
    console.log(`🎯 جستجو کامل شد: ${topUsers.length} کاربر با لایک یافت شد`);
    
    // مرتب‌سازی بر اساس تعداد لایک (نزولی)
    topUsers.sort((a, b) => b.likeCount - a.likeCount);
    
    // برگرداندن فقط تعداد درخواستی
    const result = topUsers.slice(0, limit);
    console.log(`🏆 ${result.length} کاربر برتر برگردانده شد`);
    
    return result;
    
  } catch (error) {
    console.error('خطا در دریافت کاربران برتر:', error);
    return [];
  }
};

// تابع نمایش رنکینگ کاربران برتر
window.displayTopUsersRanking = async function(containerId = 'top-users-ranking') {
  try {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('کانتینر رنکینگ یافت نشد');
      return;
    }
    
    // نمایش وضعیت بارگذاری
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--modern-primary);">
        <div style="font-size: 1.2rem; margin-bottom: 1rem;">🏆</div>
        <div style="font-weight: bold; margin-bottom: 0.5rem;">Searching for users with real likes...</div>
        <div style="font-size: 0.9rem; color: var(--modern-text-secondary);">Please wait, this may take a few seconds</div>
        <div style="margin-top: 1rem;">
          <div class="modern-alert modern-alert-info">
            🔍 Searching in first 200 indices for active users with likes
          </div>
        </div>
      </div>
    `;
    
    // استفاده از داده‌های واقعی
    console.log('🔄 دریافت داده‌های واقعی رنکینگ...');
    const topUsers = await window.getTopLikedUsers(10);
    
    if (topUsers.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--modern-text-secondary);">
          <div style="font-size: 1.2rem; margin-bottom: 1rem;">📊</div>
          <div style="font-weight: bold; margin-bottom: 0.5rem;">No users with likes found</div>
          <div style="font-size: 0.9rem; margin-bottom: 1rem;">No users have received likes yet</div>
          <div class="modern-alert modern-alert-info">
            💡 To get started, you can like existing users
          </div>
        </div>
      `;
      return;
    }
    
    let rankingHTML = `
      <div class="modern-card" style="padding: 1.5rem; margin-bottom: 1rem;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h3 class="modern-heading-1" style="margin: 0;">🏆 Top Users Ranking</h3>
          <div style="color: var(--modern-text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">Based on received likes</div>
        </div>
        
        <!-- بخش رای‌گیری با ایندکس -->
        <div class="modern-card" style="padding: 1rem; margin-bottom: 1rem;">
          <div style="text-align: center; margin-bottom: 1rem;">
            <div style="color: var(--modern-primary); font-size: 1rem; font-weight: bold; margin-bottom: 0.5rem;">🗳️ Vote for Index</div>
            <div style="color: var(--modern-text-muted); font-size: 0.8rem;">Enter the index you want to vote for</div>
          </div>
          
          <div style="display: flex; gap: 0.5rem; align-items: center; justify-content: center; flex-wrap: wrap;">
            <input type="number" id="vote-index-input" placeholder="Example: 1" 
                   class="modern-input" style="width: 100px; text-align: center; font-size: 0.9rem;">
            <button onclick="window.voteForIndex(true)" 
                    class="modern-btn modern-btn-primary" style="font-size: 0.9rem;">
              👍 Like
            </button>
            <button onclick="window.voteForIndex(false)" 
                    class="modern-btn" style="background: var(--modern-danger-gradient); font-size: 0.9rem;">
              👎 Dislike
            </button>
            <button onclick="window.testVoteButtons()" 
                    class="modern-btn" style="background: var(--modern-secondary-gradient); font-size: 0.8rem;">
              🧪 Test Buttons
            </button>
          </div>
          
          <div id="vote-result" style="text-align: center; margin-top: 0.5rem; font-size: 0.8rem;"></div>
        </div>
        
        <div style="display: grid; gap: 0.8rem;">
    `;
    
    topUsers.forEach((user, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const rankColor = rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : rank === 3 ? '#cd7f32' : '#a786ff';
      
      rankingHTML += `
        <div class="modern-card" style="padding: 1rem; display: flex; align-items: center; gap: 1rem;">
          <div style="text-align: center; min-width: 60px;">
            <div style="color: ${rankColor}; font-size: 1.5rem; font-weight: bold;">${medal}</div>
            <div style="color: var(--modern-text-muted); font-size: 0.7rem;">Rank</div>
          </div>
          
          <div style="flex: 1;">
            <div style="color: var(--modern-text-primary); font-size: 0.9rem; font-weight: bold; margin-bottom: 0.3rem;">
              ایندکس: IAM${user.index.toString().padStart(5, '0')}
            </div>
            <div style="color: var(--modern-secondary); font-size: 0.8rem; font-family: monospace; word-break: break-all;">
              ${user.address}
            </div>
          </div>
          
          <div style="text-align: center; min-width: 80px;">
            <div style="color: var(--modern-primary); font-size: 1.1rem; font-weight: bold;">${user.likeCount}</div>
            <div style="color: var(--modern-text-muted); font-size: 0.7rem;">Likes</div>
            <div style="margin-top: 0.5rem;">
              <button onclick="window.voteForUser('${user.address}', true)" 
                      class="modern-btn modern-btn-primary" style="font-size: 0.7rem; margin-right: 0.3rem;">
                👍
              </button>
              <button onclick="window.voteForUser('${user.address}', false)" 
                      class="modern-btn" style="background: var(--modern-danger-gradient); font-size: 0.7rem;">
                👎
              </button>
            </div>
            <div id="vote-status-${user.address}" style="font-size: 0.6rem; margin-top: 0.3rem; color: var(--modern-text-muted);">
              Loading...
            </div>
          </div>
        </div>
      `;
    });
    
    rankingHTML += `
        </div>
        
        <div style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--modern-border-light);">
          <div style="color: var(--modern-text-muted); font-size: 0.8rem;">
            آخرین بروزرسانی: ${new Date().toLocaleString('fa-IR')}
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = rankingHTML;
    
  } catch (error) {
    console.error('خطا در نمایش رنکینگ:', error);
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #ff4444;">
          <div style="font-size: 1.2rem; margin-bottom: 1rem;">❌</div>
          <div>خطا در بارگذاری رنکینگ</div>
        </div>
      `;
    }
    
    // Load voting status for each user
    await window.loadVotingStatusForUsers(topUsers);
  }
};

// Function to load voting status for users in ranking
window.loadVotingStatusForUsers = async function(users) {
  try {
    if (!window.contractConfig || !window.contractConfig.contract) {
      await window.connectWallet();
    }
    const contract = window.contractConfig.contract;
    
    if (!contract) {
      console.error('Contract not connected');
      return;
    }

    const currentUserAddress = window.contractConfig.signer?.address;
    if (!currentUserAddress) {
      console.log('No wallet connected, skipping vote status');
      return;
    }

    // Load vote status for each user
    for (const user of users) {
      try {
        // Check if this is the current user (self-vote)
        if (user.address.toLowerCase() === currentUserAddress.toLowerCase()) {
          const statusElement = document.getElementById(`vote-status-${user.address}`);
          if (statusElement) {
            statusElement.innerHTML = '<span style="color: #ffaa00;">⚠️ Cannot vote for yourself</span>';
          }
          continue; // Skip loading vote status for self
        }
        
        const voteStatus = await contract.userVotes(currentUserAddress, user.address);
        const statusElement = document.getElementById(`vote-status-${user.address}`);
        
        if (statusElement) {
          if (voteStatus == 1) {
            statusElement.innerHTML = '<span style="color: #00ff88;">✓ Liked</span>';
          } else if (voteStatus == 2) {
            statusElement.innerHTML = '<span style="color: #ff4444;">✗ Disliked</span>';
          } else {
            statusElement.innerHTML = '<span style="color: var(--modern-text-muted);">No vote</span>';
          }
        }
      } catch (error) {
        console.warn(`Error loading vote status for ${user.address}:`, error);
        const statusElement = document.getElementById(`vote-status-${user.address}`);
        if (statusElement) {
          statusElement.innerHTML = '<span style="color: var(--modern-text-muted);">Error</span>';
        }
      }
    }
  } catch (error) {
    console.error('Error loading voting status:', error);
  }
};

// تابع بهبود یافته برای دریافت کاربران برتر با عملکرد بهتر
window.getTopLikedUsersOptimized = async function(limit = 10) {
  console.log('🚀 شروع دریافت کاربران برتر بهینه‌سازی شده...');
  try {
    if (!window.contractConfig || !window.contractConfig.contract) {
      await window.connectWallet();
    }
    const contract = window.contractConfig.contract;
    
    if (!contract) {
      console.error('قرارداد متصل نیست');
      return [];
    }

    const topUsers = [];
    const batchSize = 50; // پردازش دسته‌ای برای بهبود عملکرد
    
    // جستجو در کاربران فعال برای یافتن برترین‌ها
    for (let batch = 0; batch < 8; batch++) { // 8 batch * 50 = 400 کاربر برای یافتن کاربران بیشتر
      const startIndex = batch * batchSize + 1;
      const endIndex = (batch + 1) * batchSize;
      
      const promises = [];
      
      for (let i = startIndex; i <= endIndex; i++) {
        promises.push(
          contract.indexToAddress(i).then(address => ({ index: i, address }))
        );
      }
      
      try {
        const results = await Promise.allSettled(promises);
        
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value.address && 
              result.value.address !== '0x0000000000000000000000000000000000000000') {
            
            try {
              const userData = await contract.users(result.value.address);
              
              if (userData && userData.activated) {
                const likeCount = await contract.likeCount(result.value.address);
                
                if (likeCount && BigInt(likeCount) > 0n) {
                  topUsers.push({
                    index: result.value.index,
                    address: result.value.address,
                    likeCount: Number(likeCount),
                    userData: userData
                  });
                }
              }
            } catch (e) {
              continue;
            }
          }
        }
      } catch (e) {
        console.log(`خطا در پردازش batch ${batch}:`, e);
        continue;
      }
    }
    
    // مرتب‌سازی بر اساس تعداد لایک (نزولی)
    topUsers.sort((a, b) => b.likeCount - a.likeCount);
    
    // برگرداندن فقط تعداد درخواستی
    return topUsers.slice(0, limit);
    
  } catch (error) {
    console.error('خطا در دریافت کاربران برتر:', error);
    return [];
  }
};

// تابع نمایش اطلاعات دقیق رای‌گیری برای کاربر
window.getUserVoteDetails = async function(userAddress) {
  try {
    if (!window.contractConfig || !window.contractConfig.contract) {
      await window.connectWallet();
    }
    const contract = window.contractConfig.contract;
    
    if (!contract) {
      console.error('قرارداد متصل نیست');
      return null;
    }

    // دریافت اطلاعات رای‌گیری
    const voteStatus = await contract.getVoteStatus(userAddress);
    
    return {
      totalLikes: Number(voteStatus[0]),
      totalDislikes: Number(voteStatus[1]),
      myVote: Number(voteStatus[2]), // 0: بدون رای، 1: لایک، 2: دیسلایک
      netScore: Number(voteStatus[0]) - Number(voteStatus[1])
    };
    
  } catch (error) {
    console.error('خطا در دریافت اطلاعات رای‌گیری:', error);
    return null;
  }
};

// تابع رای‌گیری برای کاربر
window.voteForUser = async function(targetAddress, isLike) {
  try {
    console.log(`🗳️ شروع رای‌گیری برای آدرس: ${targetAddress}, نوع: ${isLike ? 'لایک' : 'دیسلایک'}`);
    
    if (!window.contractConfig || !window.contractConfig.contract) {
      console.log('🔄 اتصال به کیف پول...');
      await window.connectWallet();
    }
    const contract = window.contractConfig.contract;
    
    if (!contract) {
      throw new Error('Contract not connected');
    }

    // بررسی اتصال کیف پول
    if (!window.contractConfig.signer) {
      throw new Error('Wallet not connected');
    }

    // Check if user is trying to vote for themselves
    const currentUserAddress = window.contractConfig.signer.address;
    if (targetAddress.toLowerCase() === currentUserAddress.toLowerCase()) {
      throw new Error('Cannot vote for yourself');
    }

    console.log('⏳ ارسال تراکنش رای‌گیری...');
    
    // ارسال تراکنش رای‌گیری
    const tx = await contract.voteUser(targetAddress, isLike);
    
    console.log('⏳ انتظار برای تایید تراکنش...');
    
    // انتظار برای تایید تراکنش
    const receipt = await tx.wait();
    
    const successMessage = isLike ? '✅ Like successfully registered' : '✅ Dislike successfully registered';
    console.log(successMessage);
    
    // نمایش پیام موفقیت
    alert(successMessage);
    
    // Update voting status immediately
    const statusElement = document.getElementById(`vote-status-${targetAddress}`);
    if (statusElement) {
      statusElement.innerHTML = isLike ? 
        '<span style="color: #00ff88;">✓ Liked</span>' : 
        '<span style="color: #ff4444;">✗ Disliked</span>';
    }
    
    // بروزرسانی رنکینگ بعد از 2 ثانیه
    setTimeout(() => {
      if (typeof window.displayTopUsersRanking === 'function') {
        const rankingContainer = document.getElementById('top-users-ranking');
        if (rankingContainer) {
          window.displayTopUsersRanking('top-users-ranking');
        }
      }
    }, 2000);
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      message: successMessage
    };
    
  } catch (error) {
    console.error('❌ Error in voting:', error);
    const errorMessage = `❌ Voting error: ${error.message || 'Unknown error'}`;
    alert(errorMessage);
    return {
      success: false,
      error: error.message || 'Voting error'
    };
  }
};

// تابع کمکی برای دریافت deployer با خطایابی
window.getDeployerAddress = async function(contract) {
  try {
    if (!contract) {
      throw new Error('قرارداد موجود نیست');
    }
    
    if (typeof contract.deployer !== 'function') {
      throw new Error('تابع deployer موجود نیست');
    }
    
    return await contract.deployer();
  } catch (error) {
    console.warn('خطا در دریافت deployer:', error);
    // در صورت خطا، آدرس صفر برگردان
    return '0x0000000000000000000000000000000000000000';
  }
};

// Helper function to check if user is trying to vote for themselves
window.isSelfVote = function(targetAddress) {
  try {
    if (!window.contractConfig || !window.contractConfig.signer) {
      return false;
    }
    
    const currentUserAddress = window.contractConfig.signer.address;
    return targetAddress.toLowerCase() === currentUserAddress.toLowerCase();
  } catch (error) {
    console.warn('Error checking self-vote:', error);
    return false;
  }
};

// تابع تست سریع برای نمایش رنکینگ (غیرفعال شده)
window.getTopLikedUsersQuick = async function(limit = 10) {
  console.log('⚠️ تابع سریع غیرفعال شده - استفاده از داده‌های واقعی');
  return []; // برگرداندن آرایه خالی برای استفاده از تابع اصلی
};

// تابع تست برای بررسی عملکرد دکمه‌ها
window.testVoteButtons = function() {
  console.log('🧪 تست دکمه‌های رای‌گیری...');
  console.log('voteForIndex موجود:', typeof window.voteForIndex);
  console.log('voteForUser موجود:', typeof window.voteForUser);
  
  // تست کلیک روی دکمه
  const testButton = document.createElement('button');
  testButton.onclick = () => {
    console.log('✅ دکمه کلیک شد!');
    alert('دکمه‌ها کار می‌کنند!');
  };
  testButton.textContent = 'تست دکمه';
  document.body.appendChild(testButton);
  
  return 'تست دکمه‌ها انجام شد';
};

// Function to validate voting input and provide helpful feedback
window.validateVotingInput = function(index) {
  try {
    if (!index || index <= 0) {
      return {
        valid: false,
        message: 'Please enter a valid index (must be greater than 0)'
      };
    }
    
    if (!window.contractConfig || !window.contractConfig.signer) {
      return {
        valid: false,
        message: 'Please connect your wallet first'
      };
    }
    
    return {
      valid: true,
      message: 'Input is valid'
    };
  } catch (error) {
    return {
      valid: false,
      message: 'Error validating input: ' + error.message
    };
  }
};

// تابع رای‌گیری برای ایندکس
window.voteForIndex = async function(isLike) {
  try {
    const indexInput = document.getElementById('vote-index-input');
    const voteResult = document.getElementById('vote-result');

    if (!indexInput) {
      throw new Error('Index field not found');
    }

    const index = parseInt(indexInput.value.trim());

    if (!index || index <= 0) {
      voteResult.innerHTML = '<span style="color: #ff4444;">⚠️ Please enter a valid index</span>';
      return;
    }

    if (!window.contractConfig || !window.contractConfig.contract) {
      await window.connectWallet();
    }
    const contract = window.contractConfig.contract;

    if (!contract) {
      throw new Error('Contract not connected');
    }

    // بررسی اتصال کیف پول
    if (!window.contractConfig.signer) {
      throw new Error('Wallet not connected');
    }

    // دریافت آدرس کاربر از ایندکس
    const userAddress = await contract.indexToAddress(index);

    if (userAddress === '0x0000000000000000000000000000000000000000') {
      voteResult.innerHTML = '<span style="color: #ff4444;">⚠️ No user found with this index</span>';
      return;
    }

    // Check if user is trying to vote for themselves
    const currentUserAddress = window.contractConfig.signer.address;
    if (userAddress.toLowerCase() === currentUserAddress.toLowerCase()) {
      voteResult.innerHTML = '<span style="color: #ff4444;">❌ Cannot vote for yourself</span>';
      return;
    }

    // نمایش پیام در حال پردازش
    voteResult.innerHTML = '<span style="color: #a786ff;">⏳ Sending vote...</span>';

    // ارسال تراکنش رای‌گیری
    const tx = await contract.voteUser(userAddress, isLike);

    // انتظار برای تایید تراکنش
    const receipt = await tx.wait();

    // نمایش پیام موفقیت
    const successMessage = isLike ? '✅ Like successfully registered' : '✅ Dislike successfully registered';
    voteResult.innerHTML = `<span style="color: #00ff88;">${successMessage}</span>`;
    
    // نمایش alert هم
    alert(successMessage);

    // Update voting status for this user if they're in the ranking
    const statusElement = document.getElementById(`vote-status-${userAddress}`);
    if (statusElement) {
      statusElement.innerHTML = isLike ? 
        '<span style="color: #00ff88;">✓ Liked</span>' : 
        '<span style="color: #ff4444;">✗ Disliked</span>';
    }

    // پاک کردن فیلد ورودی
    indexInput.value = '';

    // بروزرسانی رنکینگ بعد از 2 ثانیه
    setTimeout(() => {
      if (typeof window.displayTopUsersRanking === 'function') {
        const rankingContainer = document.getElementById('top-users-ranking');
        if (rankingContainer) {
          window.displayTopUsersRanking('top-users-ranking');
        }
      }
    }, 2000);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      message: successMessage
    };

  } catch (error) {
    console.error('Error voting for index:', error);
    const voteResult = document.getElementById('vote-result');
    if (voteResult) {
      voteResult.innerHTML = `<span style="color: #ff4444;">❌ Error: ${error.message || 'Voting error'}</span>`;
    }
    return {
      success: false,
      error: error.message || 'Voting error'
    };
  }
};
