# Neon Database Integration Guide

This guide shows how to integrate Neon database with your Web3 platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install @netlify/neon
```

### 2. Set Up Database URL
You have two options:

**Option A: Environment Variable (Recommended)**
```bash
# Create a .env file
echo "NETLIFY_DATABASE_URL=your-neon-database-url" > .env
```

**Option B: Pass URL directly**
```javascript
import { neon } from '@netlify/neon';
const sql = neon('your-neon-database-url');
```

### 3. Get Your Neon Database URL
1. Go to [https://neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from your dashboard
4. It should look like: `postgresql://username:password@hostname:port/database?sslmode=require`

## 📊 Database Schema

Run the SQL commands in `database-schema.sql` to create the necessary tables:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) NOT NULL UNIQUE,
    user_index INTEGER NOT NULL UNIQUE,
    referrer VARCHAR(42),
    registration_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    amount VARCHAR(78) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    block_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    voter_address VARCHAR(42) NOT NULL,
    target_address VARCHAR(42) NOT NULL,
    is_like BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(voter_address, target_address)
);
```

## 💻 Usage Examples

### Basic Connection
```javascript
import { neon } from '@netlify/neon';

const sql = neon(); // Uses NETLIFY_DATABASE_URL env var

// Simple query
const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
```

### Store User Registration
```javascript
const userData = {
  address: '0x1234...',
  index: 1,
  referrer: '0x5678...',
  registrationTime: new Date().toISOString()
};

await sql`
  INSERT INTO users (address, user_index, referrer, registration_time)
  VALUES (${userData.address}, ${userData.index}, ${userData.referrer}, ${userData.registrationTime})
`;
```

### Store Transaction
```javascript
const transactionData = {
  userAddress: '0x1234...',
  transactionHash: '0xabcd...',
  amount: '1000000000000000000',
  transactionType: 'purchase',
  blockNumber: 12345678
};

await sql`
  INSERT INTO transactions (user_address, transaction_hash, amount, transaction_type, block_number)
  VALUES (${transactionData.userAddress}, ${transactionData.transactionHash}, 
          ${transactionData.amount}, ${transactionData.transactionType}, ${transactionData.blockNumber})
`;
```

### Store Vote
```javascript
const voteData = {
  voterAddress: '0x1234...',
  targetAddress: '0x5678...',
  isLike: true
};

await sql`
  INSERT INTO votes (voter_address, target_address, is_like)
  VALUES (${voteData.voterAddress}, ${voteData.targetAddress}, ${voteData.isLike})
  ON CONFLICT (voter_address, target_address) 
  DO UPDATE SET is_like = ${voteData.isLike}
`;
```

### Get User Data
```javascript
// Get user by address
const [user] = await sql`
  SELECT * FROM users WHERE address = ${address}
`;

// Get user by index
const [user] = await sql`
  SELECT * FROM users WHERE user_index = ${index}
`;
```

### Get Vote Statistics
```javascript
const [stats] = await sql`
  SELECT 
    COUNT(CASE WHEN is_like = true THEN 1 END) as likes,
    COUNT(CASE WHEN is_like = false THEN 1 END) as dislikes
  FROM votes 
  WHERE target_address = ${targetAddress}
`;
```

## 🧪 Testing

Run the test files to verify everything works:

```bash
# Test basic connection (requires NETLIFY_DATABASE_URL)
node test-neon.js

# Test with examples (no database required)
node test-neon-with-example.js
```

## 🔧 Integration with Your Web3 Platform

### 1. Import the Database Service
```javascript
import DatabaseService from './neon-integration-example.js';

const db = new DatabaseService();
```

### 2. Store Data When Users Interact
```javascript
// When user connects wallet
async function onWalletConnect(address, index) {
  try {
    await db.storeUserRegistration({
      address,
      index,
      referrer: null,
      registrationTime: new Date().toISOString()
    });
    console.log('✅ User data stored');
  } catch (error) {
    console.error('❌ Failed to store user data:', error);
  }
}

// When transaction is confirmed
async function onTransactionConfirmed(txHash, userAddress, amount) {
  try {
    await db.storeTransaction({
      userAddress,
      transactionHash: txHash,
      amount: amount.toString(),
      transactionType: 'purchase',
      blockNumber: await provider.getBlockNumber()
    });
    console.log('✅ Transaction stored');
  } catch (error) {
    console.error('❌ Failed to store transaction:', error);
  }
}
```

## 🚨 Important Notes

1. **Environment Variables**: Make sure `NETLIFY_DATABASE_URL` is set correctly
2. **Error Handling**: Always wrap database calls in try-catch blocks
3. **Data Types**: Store large numbers as strings to avoid precision issues
4. **Security**: Never expose your database URL in client-side code
5. **Performance**: Use indexes on frequently queried columns

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Netlify Neon Package](https://www.npmjs.com/package/@netlify/neon)

## 🆘 Troubleshooting

### Common Issues

1. **"connection string is not provided"**
   - Set `NETLIFY_DATABASE_URL` environment variable
   - Or pass URL directly: `neon('your-url')`

2. **"Database connection failed"**
   - Check your database URL format
   - Ensure database is running and accessible
   - Verify network connectivity

3. **"Table doesn't exist"**
   - Run the SQL schema from `database-schema.sql`
   - Check table names and column names

4. **"Permission denied"**
   - Check database user permissions
   - Ensure user has access to the database

### Getting Help

- Check the console for detailed error messages
- Verify your database URL format
- Test with simple queries first
- Check Neon dashboard for connection status
