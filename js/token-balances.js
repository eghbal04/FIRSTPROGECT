// بررسی موجودی‌های کاربر
window.TokenBalances = {
    async checkConnection() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not installed');
        }
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
            throw new Error('No account found');
        }

        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x89') { // Polygon Mainnet
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x89' }]
            }).catch(async (error) => {
                if (error.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x89',
                            chainName: 'Polygon Mainnet',
                            nativeCurrency: {
                                name: 'MATIC',
                                symbol: 'MATIC',
                                decimals: 18
                            },
                            rpcUrls: ['https://polygon-rpc.com'],
                            blockExplorerUrls: ['https://polygonscan.com']
                        }]
                    });
                }
            });
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        return { provider, account: accounts[0] };
    },

    async getTokenBalance(address, tokenAddress, tokenAbi, decimals = 18) {
        try {
            const { provider } = await this.checkConnection();
            const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);
            const balance = await contract.balanceOf(address);
            return ethers.utils.formatUnits(balance, decimals);
        } catch (error) {
            console.warn('Error getting token balance:', error);
            return null;
        }
    },

    async getMaticBalance(address) {
        try {
            const { provider } = await this.checkConnection();
            const balance = await provider.getBalance(address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.warn('Error getting MATIC balance:', error);
            return null;
        }
    },

    async getAllBalances(address) {
        const balances = {
            cpa: '0',
            dai: '0',
            matic: '0'
        };

        try {
            // CPA Balance
            if (window.CONTRACT_ADDRESS && window.CONTRACT_ABI) {
                const cpaBalance = await this.getTokenBalance(
                    address,
                    window.CONTRACT_ADDRESS,
                    window.CONTRACT_ABI
                );
                if (cpaBalance) balances.cpa = Number(cpaBalance).toFixed(2);
            }

                    // DAI Balance (display as USDC)
        const daiBalance = await this.getTokenBalance(
            address,
            window.DAI_ADDRESS,
            window.DAI_ABI,
            18 // DAI has 18 decimals
        );
            if (daiBalance) balances.dai = Number(daiBalance).toFixed(2);

            // MATIC Balance
            const maticBalance = await this.getMaticBalance(address);
            if (maticBalance) balances.matic = Number(maticBalance).toFixed(4);

        } catch (error) {
            console.error('Error getting balances:', error);
        }

        return balances;
    }
};
