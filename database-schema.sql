-- Database schema for your Web3 platform
-- Run this in your Neon database to create the necessary tables

-- Users table to store user registration data
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) NOT NULL UNIQUE,
    user_index INTEGER NOT NULL UNIQUE,
    referrer VARCHAR(42),
    registration_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table to store blockchain transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    amount VARCHAR(78) NOT NULL, -- Store as string to handle large numbers
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'transfer', 'claim', etc.
    block_number BIGINT NOT NULL,
    gas_used VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Votes table to store user voting data
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    voter_address VARCHAR(42) NOT NULL,
    target_address VARCHAR(42) NOT NULL,
    is_like BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(voter_address, target_address)
);

-- User stats table for caching frequently accessed data
CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL UNIQUE,
    total_transactions INTEGER DEFAULT 0,
    total_amount VARCHAR(78) DEFAULT '0',
    likes_received INTEGER DEFAULT 0,
    dislikes_received INTEGER DEFAULT 0,
    net_score INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_index ON users(user_index);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_address);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_address);
CREATE INDEX IF NOT EXISTS idx_user_stats_address ON user_stats(user_address);

-- Function to update user stats when votes change
CREATE OR REPLACE FUNCTION update_user_vote_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the target user
    INSERT INTO user_stats (user_address, likes_received, dislikes_received, net_score, updated_at)
    VALUES (
        NEW.target_address,
        (SELECT COUNT(*) FROM votes WHERE target_address = NEW.target_address AND is_like = true),
        (SELECT COUNT(*) FROM votes WHERE target_address = NEW.target_address AND is_like = false),
        (SELECT COUNT(*) FROM votes WHERE target_address = NEW.target_address AND is_like = true) - 
        (SELECT COUNT(*) FROM votes WHERE target_address = NEW.target_address AND is_like = false),
        NOW()
    )
    ON CONFLICT (user_address) 
    DO UPDATE SET
        likes_received = EXCLUDED.likes_received,
        dislikes_received = EXCLUDED.dislikes_received,
        net_score = EXCLUDED.net_score,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats when votes change
CREATE TRIGGER trigger_update_vote_stats
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_user_vote_stats();

-- Sample data (optional - remove in production)
INSERT INTO users (address, user_index, referrer, registration_time) VALUES
('0x1234567890123456789012345678901234567890', 1, NULL, NOW()),
('0x0987654321098765432109876543210987654321', 2, '0x1234567890123456789012345678901234567890', NOW()),
('0x1111111111111111111111111111111111111111', 3, '0x1234567890123456789012345678901234567890', NOW())
ON CONFLICT (address) DO NOTHING;
