const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Customer = require('./models/Customer');
const customerRoutes = require('./routes/customers');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/churn_prediction', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  seedDatabase();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Seed database with sample data
async function seedDatabase() {
  try {
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('Seeding database with sample customers...');
      
      const sampleCustomers = generateSampleCustomers(100);
      await Customer.insertMany(sampleCustomers);
      
      console.log(`Seeded database with ${sampleCustomers.length} customers`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

function generateSampleCustomers(count) {
  const names = [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
    'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'Christopher Lee', 'Amanda Thompson',
    'Matthew Garcia', 'Jessica Rodriguez', 'Daniel Hernandez', 'Ashley Lopez', 'James Gonzalez',
    'Michelle Perez', 'Ryan Turner', 'Stephanie Phillips', 'Kevin Campbell', 'Nicole Parker'
  ];
  
  const companies = [
    'TechCorp', 'DataSystems', 'CloudWorks', 'FinanceBase', 'RetailMax',
    'HealthTech', 'EduSoft', 'MediaGroup', 'LogisticsPro', 'ConsultingFirm',
    'InnovateLab', 'GlobalSolutions', 'SmartAnalytics', 'FutureVision', 'AlphaTech'
  ];

  const customers = [];
  
  for (let i = 0; i < count; i++) {
    const name = names[i % names.length];
    const company = companies[i % companies.length];
    const createdDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const daysSinceLastLogin = Math.floor(Math.random() * 90);
    const lastActivity = new Date(Date.now() - daysSinceLastLogin * 24 * 60 * 60 * 1000);
    
    const customer = {
      name: `${name} ${i > 19 ? Math.floor(i/20) : ''}`.trim(),
      email: `${name.toLowerCase().replace(' ', '.')}.${i}@${company.toLowerCase()}.com`,
      company,
      subscriptionValue: Math.floor(Math.random() * 9500) + 500,
      lastActivity,
      supportTickets: Math.floor(Math.random() * 15),
      loginFrequency: Math.floor(Math.random() * 25) + 1,
      contractLength: Math.floor(Math.random() * 30) + 6,
      features: {
        daysSinceLastLogin,
        avgSessionDuration: Math.floor(Math.random() * 120) + 10,
        totalTransactions: Math.floor(Math.random() * 200) + 5,
        avgTransactionValue: Math.floor(Math.random() * 500) + 50,
        productUsage: Math.floor(Math.random() * 100),
        supportSatisfaction: Math.floor(Math.random() * 6) + 4,
        contractRenewalHistory: Math.floor(Math.random() * 5)
      },
      createdAt: createdDate,
      updatedAt: createdDate
    };
    
    customers.push(customer);
  }
  
  return customers;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;