const { Role } = require('../../models/auth/auth');
const connectDatabase = require('../database');

const defaultRoles = [
    {
        name: 'user',
        description: 'Regular user with basic access',
        role_type: 'user',
        is_active: true
    },
    {
        name: 'admin',
        description: 'Administrator with management access',
        role_type: 'admin',
        is_active: true
    },
    {
        name: 'superadmin',
        description: 'Super administrator with full system access',
        role_type: 'superadmin',
        is_active: true
    }
];

const seedRoles = async () => {
    try {
        // Check if roles already exist
        const existingRoles = await Role.find({});
        
        if (existingRoles.length === 0) {
            // Insert default roles
            await Role.insertMany(defaultRoles);
            console.log('Default roles seeded successfully!');
            console.log('Created roles:');
            console.log('1. user');
            console.log('2. admin');
            console.log('3. superadmin');
        } else {
            console.log('Roles already exist in the database. Skipping seeding.');
            console.log('Existing roles:');
            existingRoles.forEach(role => {
                console.log(`- ${role.name}: ${role._id}`);
            });
        }

        // Return the roles for use in the application
        return await Role.find({});
    } catch (error) {
        console.error('Error seeding roles:', error);
        throw error;
    }
};

// If this file is run directly (npm run seed:roles)
if (require.main === module) {
    connectDatabase()
        .then(() => seedRoles())
        .then(() => {
            console.log('Seeding completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = {
    seedRoles,
    defaultRoles
}; 