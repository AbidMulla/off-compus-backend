const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        // Replace localhost with 127.0.0.1 if present in the URI
        const uri = process.env.MONGODB_URI.replace('localhost', '127.0.0.1');
        
        const conn = await mongoose.connect(uri);

        console.log('=================================');
        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
        console.log(`Connected to: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        console.log('=================================');
        
    } catch (error) {
        console.error('=================================');
        console.error('❌ Error connecting to MongoDB:');
        console.error(`Error: ${error.message}`);
        console.error('=================================');
        process.exit(1);
    }
};

module.exports = connectDB; 