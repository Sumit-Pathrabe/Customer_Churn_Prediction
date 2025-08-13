const express = require('express');
const Customer = require('../models/Customer');
const router = express.Router();

// Get all customers with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      riskLevel, 
      search,
      sortBy = 'churnRisk',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const customers = await Customer.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Customer with this email already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predict churn for a customer
router.post('/:id/predict', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const churnProbability = customer.calculateChurnRisk();
    const riskLevel = churnProbability < 0.3 ? 'low' : churnProbability < 0.7 ? 'medium' : 'high';
    
    const factors = [];
    if (customer.features.daysSinceLastLogin > 14) factors.push('Inactive user');
    if (customer.supportTickets > 5) factors.push('High support volume');
    if (customer.features.supportSatisfaction < 6) factors.push('Low satisfaction');
    if (customer.loginFrequency < 5) factors.push('Low engagement');

    const prediction = {
      date: new Date(),
      churnProbability,
      riskLevel,
      factors,
      modelVersion: '1.0'
    };

    customer.predictions.push(prediction);
    customer.churnRisk = churnProbability;
    customer.status = customer.determineStatus();
    
    await customer.save();

    res.json({
      prediction,
      customer: {
        id: customer._id,
        churnRisk: customer.churnRisk,
        status: customer.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics data
router.get('/analytics/summary', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    const atRiskCustomers = await Customer.countDocuments({ status: 'at_risk' });
    const churnedCustomers = await Customer.countDocuments({ status: 'churned' });

    const avgChurnRisk = await Customer.aggregate([
      {
        $group: {
          _id: null,
          avgRisk: { $avg: '$churnRisk' },
          avgSubscriptionValue: { $avg: '$subscriptionValue' },
          avgSupportTickets: { $avg: '$supportTickets' }
        }
      }
    ]);

    const riskDistribution = await Customer.aggregate([
      {
        $bucket: {
          groupBy: '$churnRisk',
          boundaries: [0, 0.3, 0.7, 1.0],
          default: 'other',
          output: {
            count: { $sum: 1 },
            customers: { $push: { name: '$name', email: '$email', churnRisk: '$churnRisk' } }
          }
        }
      }
    ]);

    const monthlyTrends = await Customer.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newCustomers: { $sum: 1 },
          avgChurnRisk: { $avg: '$churnRisk' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $limit: 12
      }
    ]);

    res.json({
      summary: {
        totalCustomers,
        activeCustomers,
        atRiskCustomers,
        churnedCustomers,
        churnRate: totalCustomers > 0 ? (churnedCustomers / totalCustomers * 100).toFixed(2) : 0,
        avgChurnRisk: avgChurnRisk[0]?.avgRisk || 0,
        avgSubscriptionValue: avgChurnRisk[0]?.avgSubscriptionValue || 0,
        avgSupportTickets: avgChurnRisk[0]?.avgSupportTickets || 0
      },
      riskDistribution,
      monthlyTrends
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk predict for all customers
router.post('/predict/bulk', async (req, res) => {
  try {
    const customers = await Customer.find({ status: { $ne: 'churned' } });
    const updatePromises = customers.map(async (customer) => {
      const churnProbability = customer.calculateChurnRisk();
      const riskLevel = churnProbability < 0.3 ? 'low' : churnProbability < 0.7 ? 'medium' : 'high';
      
      customer.churnRisk = churnProbability;
      customer.status = customer.determineStatus();
      
      const prediction = {
        date: new Date(),
        churnProbability,
        riskLevel,
        factors: [],
        modelVersion: '1.0'
      };
      
      customer.predictions.push(prediction);
      return customer.save();
    });

    await Promise.all(updatePromises);
    
    res.json({
      message: 'Bulk prediction completed',
      processedCustomers: customers.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;