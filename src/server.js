const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Budget = require('./models/Budget');
const Expense = require('./models/Expense');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Modified database connection with async initialization
async function startServer() {
    try {
        // Connect to MongoDB first
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/budget-masters');
        console.log('✅ MongoDB connected successfully');

        // Routes
        app.use('/api/users', require('./routes/users'));
        app.use('/api/budgets', require('./routes/budgets'));
        app.use('/api/expenses', require('./routes/expenses'));

        // Leaderboard endpoint
        app.get('/api/leaderboard', async (req, res) => {
            console.log('🔍 Leaderboard API endpoint called');
            try {
                const users = await User.find();
                console.log('👥 Found users:', users.length);

                if (!users || users.length === 0) {
                    console.log('⚠️ No users found in database');
                    return res.json({ 
                        success: true, 
                        leaderboard: [],
                        userStats: {
                            rank: 0,
                            totalSavings: 0,
                            savingsPercentage: 0
                        }
                    });
                }

                const leaderboard = users.map(user => ({
                    username: user.username,
                    totalSavings: user.totalSavings || 0,
                    savingsPercentage: user.savingsPercentage || 0
                })).sort((a, b) => b.savingsPercentage - a.savingsPercentage);

                console.log('📊 Leaderboard calculated:', leaderboard);

                res.json({ 
                    success: true, 
                    leaderboard,
                    userStats: {
                        rank: 1, // We'll calculate this properly based on current user
                        totalSavings: 0,
                        savingsPercentage: 0
                    }
                });
            } catch (error) {
                console.error('❌ Error in leaderboard:', error);
                res.status(500).json({ 
                    success: false, 
                    message: 'Failed to load leaderboard',
                    error: error.message 
                });
            }
        });

        // Start server after successful database connection
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log('💾 MongoDB Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
        });

    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
}

// Start the server
startServer();