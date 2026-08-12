require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Hash password
    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('Test users already exist. Skipping creation.');
      await mongoose.disconnect();
      return;
    }

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('✓ Admin created:', admin.email);

    // Create manager
    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@test.com',
      password: hashedPassword,
      role: 'manager',
    });
    console.log('✓ Manager created:', manager.email);

    // Create employee
    const employee = await User.create({
      name: 'Employee User',
      email: 'employee@test.com',
      password: hashedPassword,
      role: 'employee',
    });
    console.log('✓ Employee created:', employee.email);

    console.log('\n=================================');
    console.log('Test users created successfully!');
    console.log('=================================');
    console.log('\nLogin Credentials:');
    console.log('------------------');
    console.log('Admin:');
    console.log('  Email: admin@test.com');
    console.log('  Password: Test@123');
    console.log('\nManager:');
    console.log('  Email: manager@test.com');
    console.log('  Password: Test@123');
    console.log('\nEmployee:');
    console.log('  Email: employee@test.com');
    console.log('  Password: Test@123');
    console.log('\nEmployee is assigned to Manager User');
    console.log('=================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
