// Expose full ABI placeholder. Replace/extend with the actual contract ABI as needed.
// Start with the minimal ABI we already use and leave room to extend.
(function(){
    window.IAM_ABI = [
        { "inputs": [{"internalType":"address","name":"","type":"address"}], "name":"users", "outputs": [
            {"internalType":"uint256","name":"index","type":"uint256"},
            {"internalType":"address","name":"referrer","type":"address"},
            {"internalType":"bool","name":"activated","type":"bool"}
        ], "stateMutability":"view", "type":"function" },
        { "inputs": [{"internalType":"address","name":"account","type":"address"}], "name":"balanceOf", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function" },
        { "inputs": [], "name": "name", "outputs": [{"internalType":"string","name":"","type":"string"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "symbol", "outputs": [{"internalType":"string","name":"","type":"string"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "decimals", "outputs": [{"internalType":"uint8","name":"","type":"uint8"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "totalSupply", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "owner", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "deployer", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
        { "inputs": [{"internalType":"address","name":"","type":"address"}], "name": "addressToIndex", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "totalUsers", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "getTotalUsers", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "usersCount", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "dai", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "daiAddress", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
        // ERC20 Transfer functions
        { "inputs": [{"internalType":"address","name":"to","type":"address"}, {"internalType":"uint256","name":"amount","type":"uint256"}], "name": "transfer", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [{"internalType":"address","name":"from","type":"address"}, {"internalType":"address","name":"to","type":"address"}, {"internalType":"uint256","name":"amount","type":"uint256"}], "name": "transferFrom", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [{"internalType":"address","name":"spender","type":"address"}, {"internalType":"uint256","name":"amount","type":"uint256"}], "name": "approve", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [{"internalType":"address","name":"owner","type":"address"}, {"internalType":"address","name":"spender","type":"address"}], "name": "allowance", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" }
        // Add other write functions here as needed, e.g., register, activate, etc.
    ];
})();


