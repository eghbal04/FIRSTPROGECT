// Database Service for Neon PostgreSQL
// This service handles all database operations for the Web3 platform

class DatabaseService {
  constructor() {
    this.databaseUrl = null;
    this.isConnected = false;
    this.connection = null;
  }

  // Initialize database connection
  async initialize() {
    try {
      // Check if we have database URL
      this.databaseUrl = this.getDatabaseUrl();
      
      if (!this.databaseUrl) {
        console.warn('⚠️ No database URL found, using localStorage fallback');
        return false;
      }

      // For client-side, we'll use a simple fetch-based approach
      // In production, you should use server-side API endpoints
      console.log('✅ Database service initialized');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return false;
    }
  }

  // Get database URL from environment or config
  getDatabaseUrl() {
    // In a real application, this would come from environment variables
    // For now, we'll return null to use localStorage fallback
    return null;
  }

  // Store user registration data
  async storeUserRegistration(userData) {
    try {
      const { address, index, referrer, registrationTime } = userData;
      
      // For now, store in localStorage as fallback
      const userKey = `user_${address}`;
      const userRecord = {
        address,
        index,
        referrer,
        registrationTime: registrationTime || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(userKey, JSON.stringify(userRecord));
      
      // Also store in users list
      const usersList = JSON.parse(localStorage.getItem('users_list') || '[]');
      const existingUserIndex = usersList.findIndex(u => u.address === address);
      
      if (existingUserIndex >= 0) {
        usersList[existingUserIndex] = userRecord;
      } else {
        usersList.push(userRecord);
      }
      
      localStorage.setItem('users_list', JSON.stringify(usersList));
      
      console.log('✅ User registration stored in localStorage:', userRecord);
      return userRecord;
    } catch (error) {
      console.error('❌ Error storing user registration:', error);
      throw error;
    }
  }

  // Get user by address
  async getUserByAddress(address) {
    try {
      const userKey = `user_${address}`;
      const userData = localStorage.getItem(userKey);
      
      if (userData) {
        return JSON.parse(userData);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting user by address:', error);
      throw error;
    }
  }

  // Get user by index
  async getUserByIndex(index) {
    try {
      const usersList = JSON.parse(localStorage.getItem('users_list') || '[]');
      const user = usersList.find(u => u.index === index);
      
      return user || null;
    } catch (error) {
      console.error('❌ Error getting user by index:', error);
      throw error;
    }
  }

  // Store transaction data
  async storeTransaction(transactionData) {
    try {
      const { 
        userAddress, 
        transactionHash, 
        amount, 
        transactionType, 
        blockNumber, 
        gasUsed 
      } = transactionData;
      
      const transactionRecord = {
        userAddress,
        transactionHash,
        amount,
        transactionType,
        blockNumber,
        gasUsed,
        createdAt: new Date().toISOString()
      };
      
      // Store individual transaction
      const txKey = `tx_${transactionHash}`;
      localStorage.setItem(txKey, JSON.stringify(transactionRecord));
      
      // Store in user's transaction list
      const userTxKey = `user_txs_${userAddress}`;
      const userTransactions = JSON.parse(localStorage.getItem(userTxKey) || '[]');
      userTransactions.push(transactionRecord);
      localStorage.setItem(userTxKey, JSON.stringify(userTransactions));
      
      // Store in global transactions list
      const allTransactions = JSON.parse(localStorage.getItem('all_transactions') || '[]');
      allTransactions.push(transactionRecord);
      localStorage.setItem('all_transactions', JSON.stringify(allTransactions));
      
      console.log('✅ Transaction stored in localStorage:', transactionRecord);
      return transactionRecord;
    } catch (error) {
      console.error('❌ Error storing transaction:', error);
      throw error;
    }
  }

  // Get user's transaction history
  async getUserTransactions(address, limit = 50) {
    try {
      const userTxKey = `user_txs_${address}`;
      const transactions = JSON.parse(localStorage.getItem(userTxKey) || '[]');
      
      return transactions.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting user transactions:', error);
      throw error;
    }
  }

  // Store voting data
  async storeVote(voteData) {
    try {
      const { voterAddress, targetAddress, isLike, timestamp } = voteData;
      
      const voteRecord = {
        voterAddress,
        targetAddress,
        isLike,
        createdAt: timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store individual vote
      const voteKey = `vote_${voterAddress}_${targetAddress}`;
      localStorage.setItem(voteKey, JSON.stringify(voteRecord));
      
      // Store in votes list
      const votesList = JSON.parse(localStorage.getItem('votes_list') || '[]');
      const existingVoteIndex = votesList.findIndex(v => 
        v.voterAddress === voterAddress && v.targetAddress === targetAddress
      );
      
      if (existingVoteIndex >= 0) {
        votesList[existingVoteIndex] = voteRecord;
      } else {
        votesList.push(voteRecord);
      }
      
      localStorage.setItem('votes_list', JSON.stringify(votesList));
      
      console.log('✅ Vote stored in localStorage:', voteRecord);
      return voteRecord;
    } catch (error) {
      console.error('❌ Error storing vote:', error);
      throw error;
    }
  }

  // Get vote statistics for a user
  async getVoteStats(targetAddress) {
    try {
      const votesList = JSON.parse(localStorage.getItem('votes_list') || '[]');
      const userVotes = votesList.filter(v => v.targetAddress === targetAddress);
      
      const stats = {
        likes: userVotes.filter(v => v.isLike === true).length,
        dislikes: userVotes.filter(v => v.isLike === false).length,
        totalVotes: userVotes.length
      };
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting vote stats:', error);
      throw error;
    }
  }

  // Get leaderboard data
  async getLeaderboard(limit = 100) {
    try {
      const usersList = JSON.parse(localStorage.getItem('users_list') || '[]');
      const votesList = JSON.parse(localStorage.getItem('votes_list') || '[]');
      
      const leaderboard = usersList.map(user => {
        const userVotes = votesList.filter(v => v.targetAddress === user.address);
        const likes = userVotes.filter(v => v.isLike === true).length;
        const dislikes = userVotes.filter(v => v.isLike === false).length;
        const netScore = likes - dislikes;
        
        return {
          address: user.address,
          index: user.index,
          likes,
          dislikes,
          netScore
        };
      });
      
      // Sort by net score
      leaderboard.sort((a, b) => b.netScore - a.netScore);
      
      return leaderboard.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting leaderboard:', error);
      throw error;
    }
  }

  // Store price data
  async storePriceData(priceData) {
    try {
      const { symbol, price, timestamp, source } = priceData;
      
      const priceRecord = {
        symbol,
        price,
        timestamp: timestamp || new Date().toISOString(),
        source: source || 'contract',
        createdAt: new Date().toISOString()
      };
      
      // Store individual price
      const priceKey = `price_${symbol}_${Date.now()}`;
      localStorage.setItem(priceKey, JSON.stringify(priceRecord));
      
      // Store in price history
      const priceHistoryKey = `price_history_${symbol}`;
      const priceHistory = JSON.parse(localStorage.getItem(priceHistoryKey) || '[]');
      priceHistory.push(priceRecord);
      
      // Keep only last 1000 records
      if (priceHistory.length > 1000) {
        priceHistory.splice(0, priceHistory.length - 1000);
      }
      
      localStorage.setItem(priceHistoryKey, JSON.stringify(priceHistory));
      
      console.log('✅ Price data stored in localStorage:', priceRecord);
      return priceRecord;
    } catch (error) {
      console.error('❌ Error storing price data:', error);
      throw error;
    }
  }

  // Get price history
  async getPriceHistory(symbol, limit = 100) {
    try {
      const priceHistoryKey = `price_history_${symbol}`;
      const priceHistory = JSON.parse(localStorage.getItem(priceHistoryKey) || '[]');
      
      return priceHistory.slice(-limit);
    } catch (error) {
      console.error('❌ Error getting price history:', error);
      throw error;
    }
  }

  // Get all data for debugging
  async getAllData() {
    try {
      const allData = {
        users: JSON.parse(localStorage.getItem('users_list') || '[]'),
        transactions: JSON.parse(localStorage.getItem('all_transactions') || '[]'),
        votes: JSON.parse(localStorage.getItem('votes_list') || '[]'),
        priceHistory: {
          IAM: JSON.parse(localStorage.getItem('price_history_IAM') || '[]'),
          binary_points: JSON.parse(localStorage.getItem('price_history_binary_points') || '[]'),
          referral_points: JSON.parse(localStorage.getItem('price_history_referral_points') || '[]'),
          monthly_points: JSON.parse(localStorage.getItem('price_history_monthly_points') || '[]')
        }
      };
      
      return allData;
    } catch (error) {
      console.error('❌ Error getting all data:', error);
      throw error;
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('user_') || 
                   key.startsWith('tx_') || 
                   key.startsWith('vote_') || 
                   key.startsWith('price_') ||
                   key === 'users_list' ||
                   key === 'all_transactions' ||
                   key === 'votes_list')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('✅ All database data cleared from localStorage');
      return true;
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}

// Export for use in other files
window.DatabaseService = DatabaseService;
