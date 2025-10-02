// Example integration of Neon database into your Web3 project
import { neon } from '@netlify/neon';

// Initialize Neon client
const sql = neon(); // automatically uses env NETLIFY_DATABASE_URL

// Example functions for your Web3 platform
export class DatabaseService {
  constructor() {
    this.sql = sql;
  }

  // Store user registration data
  async storeUserRegistration(userData) {
    try {
      const { address, index, referrer, registrationTime } = userData;
      
      const result = await this.sql`
        INSERT INTO users (address, user_index, referrer, registration_time, created_at)
        VALUES (${address}, ${index}, ${referrer}, ${registrationTime}, NOW())
        RETURNING *
      `;
      
      console.log('✅ User registration stored:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ Error storing user registration:', error);
      throw error;
    }
  }

  // Get user by address
  async getUserByAddress(address) {
    try {
      const [user] = await this.sql`
        SELECT * FROM users 
        WHERE address = ${address}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      return user;
    } catch (error) {
      console.error('❌ Error getting user by address:', error);
      throw error;
    }
  }

  // Get user by index
  async getUserByIndex(index) {
    try {
      const [user] = await this.sql`
        SELECT * FROM users 
        WHERE user_index = ${index}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      return user;
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
      
      const result = await this.sql`
        INSERT INTO transactions (
          user_address, 
          transaction_hash, 
          amount, 
          transaction_type, 
          block_number, 
          gas_used, 
          created_at
        )
        VALUES (
          ${userAddress}, 
          ${transactionHash}, 
          ${amount}, 
          ${transactionType}, 
          ${blockNumber}, 
          ${gasUsed}, 
          NOW()
        )
        RETURNING *
      `;
      
      console.log('✅ Transaction stored:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ Error storing transaction:', error);
      throw error;
    }
  }

  // Get user's transaction history
  async getUserTransactions(address, limit = 50) {
    try {
      const transactions = await this.sql`
        SELECT * FROM transactions 
        WHERE user_address = ${address}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      
      return transactions;
    } catch (error) {
      console.error('❌ Error getting user transactions:', error);
      throw error;
    }
  }

  // Store voting data
  async storeVote(voteData) {
    try {
      const { voterAddress, targetAddress, isLike, timestamp } = voteData;
      
      // First, check if user already voted for this target
      const existingVote = await this.sql`
        SELECT * FROM votes 
        WHERE voter_address = ${voterAddress} 
        AND target_address = ${targetAddress}
      `;
      
      if (existingVote.length > 0) {
        // Update existing vote
        const result = await this.sql`
          UPDATE votes 
          SET is_like = ${isLike}, updated_at = NOW()
          WHERE voter_address = ${voterAddress} 
          AND target_address = ${targetAddress}
          RETURNING *
        `;
        return result[0];
      } else {
        // Create new vote
        const result = await this.sql`
          INSERT INTO votes (voter_address, target_address, is_like, created_at)
          VALUES (${voterAddress}, ${targetAddress}, ${isLike}, NOW())
          RETURNING *
        `;
        return result[0];
      }
    } catch (error) {
      console.error('❌ Error storing vote:', error);
      throw error;
    }
  }

  // Get vote statistics for a user
  async getVoteStats(targetAddress) {
    try {
      const [stats] = await this.sql`
        SELECT 
          COUNT(CASE WHEN is_like = true THEN 1 END) as likes,
          COUNT(CASE WHEN is_like = false THEN 1 END) as dislikes,
          COUNT(*) as total_votes
        FROM votes 
        WHERE target_address = ${targetAddress}
      `;
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting vote stats:', error);
      throw error;
    }
  }

  // Get leaderboard data
  async getLeaderboard(limit = 100) {
    try {
      const leaderboard = await this.sql`
        SELECT 
          u.address,
          u.user_index,
          COALESCE(v.likes, 0) as likes,
          COALESCE(v.dislikes, 0) as dislikes,
          COALESCE(v.likes, 0) - COALESCE(v.dislikes, 0) as net_score
        FROM users u
        LEFT JOIN (
          SELECT 
            target_address,
            COUNT(CASE WHEN is_like = true THEN 1 END) as likes,
            COUNT(CASE WHEN is_like = false THEN 1 END) as dislikes
          FROM votes 
          GROUP BY target_address
        ) v ON u.address = v.target_address
        ORDER BY net_score DESC, u.created_at ASC
        LIMIT ${limit}
      `;
      
      return leaderboard;
    } catch (error) {
      console.error('❌ Error getting leaderboard:', error);
      throw error;
    }
  }
}

// Example usage in your existing Web3 functions
export async function integrateWithDatabase() {
  const db = new DatabaseService();
  
  try {
    // Example: Store user registration when they connect wallet
    const userData = {
      address: '0x1234567890123456789012345678901234567890',
      index: 1,
      referrer: '0x0987654321098765432109876543210987654321',
      registrationTime: new Date().toISOString()
    };
    
    await db.storeUserRegistration(userData);
    
    // Example: Store transaction when user makes a purchase
    const transactionData = {
      userAddress: userData.address,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      amount: '1000000000000000000', // 1 IAM token in wei
      transactionType: 'purchase',
      blockNumber: 12345678,
      gasUsed: '21000'
    };
    
    await db.storeTransaction(transactionData);
    
    // Example: Store vote when user votes
    const voteData = {
      voterAddress: userData.address,
      targetAddress: '0x1111111111111111111111111111111111111111',
      isLike: true,
      timestamp: new Date().toISOString()
    };
    
    await db.storeVote(voteData);
    
    console.log('✅ Database integration examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Database integration failed:', error);
  }
}

// Export the database service for use in other files
export default DatabaseService;
