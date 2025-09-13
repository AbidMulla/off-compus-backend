const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const cors = require('cors');

// Import database connection and seeders
const connectDatabase = require('../config/database');
const { seedRoles } = require('../config/seeders/roleSeeder');

// Import routes
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const adminRoutes = require('../routes/adminRoutes');


// Enable CORS (Allow frontend from localhost:3000 and localhost:3001)
let CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'];
app.use(cors({
    origin: CORS_ORIGINS,
    credentials: true
}));

// Middleware for parsing JSON bodies
app.use(express.json());


// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Node + MongoDB Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Connect to database and create collections with default roles
const initializeDatabase = async () => {
    try {
        await connectDatabase();
        
        // Create default roles (user, admin, superadmin)
        await seedRoles();
        
        console.log('Database collections and default roles created successfully!');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
};

// Start everything
initializeDatabase();

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
