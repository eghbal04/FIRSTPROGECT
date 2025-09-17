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
        { "inputs": [], "name": "daiAddress", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" }
        // Add write functions here as needed, e.g., register, activate, transfer, approve, etc.
    ];
})();


