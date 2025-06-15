// config.js - پیکربندی بروزرسانی شده
if (typeof ethers === 'undefined') {
	throw new Error('Ethers.js not loaded!');
}

// آدرس قرارداد بروزرسانی شده
const CONTRACT_ADDRESS = "0x77bFda2292cc1b51E6C3380955F2E4861306c0d2";

// ABI کامل و بروزرسانی شده
const LEVELUP_ABI = [
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
							"name": "referrer",
							"type": "address"
					}
			],
			"name": "registerAndActivate",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
	},
	{
			"inputs": [],
			"name": "claimBinaryReward",
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
			"name": "increaseBinaryPointCap",
			"outputs": [],
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
			"name": "MIN_ACTIVATION_MATIC",
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

// تنظیمات شبکه
const NETWORK_CONFIG = {
	chainId: '0x89', // Polygon Mainnet
	chainName: 'Polygon Mainnet',
	nativeCurrency: {
			name: 'MATIC',
			symbol: 'MATIC',
			decimals: 18
	},
	rpcUrls: ['https://polygon-rpc.com/'],
	blockExplorerUrls: ['https://polygonscan.com/']
};

// متغیرهای global
let provider, signer, contract;

// تابع اتصال به شبکه مناسب
async function switchToPolygon() {
	try {
			await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: NETWORK_CONFIG.chainId }],
			});
	} catch (switchError) {
			if (switchError.code === 4902) {
					try {
							await window.ethereum.request({
									method: 'wallet_addEthereumChain',
									params: [NETWORK_CONFIG],
							});
					} catch (addError) {
							console.error('خطا در افزودن شبکه:', addError);
					}
			}
	}
}

// راه‌اندازی اولیه
async function initializeWeb3() {
	try {
			if (!window.ethereum) {
					throw new Error('کیف پول یافت نشد');
			}

			await switchToPolygon();
			
			provider = new ethers.providers.Web3Provider(window.ethereum);
			signer = provider.getSigner();
			contract = new ethers.Contract(CONTRACT_ADDRESS, LEVELUP_ABI, signer);
			
			return true;
	} catch (error) {
			console.error("خطا در راه‌اندازی Web3:", error);
			provider = ethers.getDefaultProvider();
			return false;
	}
}

// در معرض گذاشتن متغیرها
window.contractConfig = {
	CONTRACT_ADDRESS,
	LEVELUP_ABI,
	NETWORK_CONFIG,
	provider,
	signer,
	contract,
	initializeWeb3,
	switchToPolygon
};

// راه‌اندازی خودکار
if (typeof window !== 'undefined') {
	window.addEventListener('load', initializeWeb3);
}