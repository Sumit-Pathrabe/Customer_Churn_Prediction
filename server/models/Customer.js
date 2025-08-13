const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  subscriptionValue: {
    type: Number,
    required: true,
    min: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  supportTickets: {
    type: Number,
    default: 0,
    min: 0
  },
  loginFrequency: {
    type: Number,
    default: 0,
    min: 0
  },
  contractLength: {
    type: Number,
    required: true,
    min: 1
  },
  churnRisk: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  status: {
    type: String,
    enum: ['active', 'churned', 'at_risk'],
    default: 'active'
  },
  features: {
    daysSinceLastLogin: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 },
    totalTransactions: { type: Number, default: 0 },
    avgTransactionValue: { type: Number, default: 0 },
    productUsage: { type: Number, default: 0 },
    supportSatisfaction: { type: Number, default: 5, min: 1, max: 10 },
    contractRenewalHistory: { type: Number, default: 0 }
  },
  predictions: [{
    date: { type: Date, default: Date.now },
    churnProbability: { type: Number, min: 0, max: 1 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    factors: [String],
    modelVersion: { type: String, default: '1.0' }
  }],
  interactions: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'call', 'meeting', 'support'] },
    description: String,
    outcome: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ churnRisk: -1 });
customerSchema.index({ 'predictions.date': -1 });

// Pre-save middleware to calculate churn risk
customerSchema.pre('save', function(next) {
  if (this.isModified('features') || this.isNew) {
    this.churnRisk = this.calculateChurnRisk();
    this.status = this.determineStatus();
  }
  next();
});

// Method to calculate churn risk based on features
customerSchema.methods.calculateChurnRisk = function() {
  const weights = {
    daysSinceLastLogin: 0.25,
    supportTickets: 0.20,
    loginFrequency: -0.15,
    contractLength: -0.10,
    supportSatisfaction: -0.15,
    subscriptionValue: -0.10,
    productUsage: -0.05
  };

  let risk = 0.5; // Base risk

  // Days since last login (higher = more risk)
  risk += (this.features.daysSinceLastLogin / 30) * weights.daysSinceLastLogin;

  // Support tickets (more tickets = more risk)
  risk += Math.min(this.supportTickets / 10, 1) * weights.supportTickets;

  // Login frequency (higher frequency = less risk)
  risk += (1 - Math.min(this.loginFrequency / 30, 1)) * Math.abs(weights.loginFrequency);

  // Contract length (longer = less risk)
  risk += (1 - Math.min(this.contractLength / 36, 1)) * Math.abs(weights.contractLength);

  // Support satisfaction (higher = less risk)
  risk += (1 - this.features.supportSatisfaction / 10) * Math.abs(weights.supportSatisfaction);

  // Subscription value (higher = less risk)
  risk += (1 - Math.min(this.subscriptionValue / 10000, 1)) * Math.abs(weights.subscriptionValue);

  // Product usage (higher = less risk)
  risk += (1 - Math.min(this.features.productUsage / 100, 1)) * Math.abs(weights.productUsage);

  return Math.max(0, Math.min(1, risk));
};

// Method to determine status based on churn risk
customerSchema.methods.determineStatus = function() {
  if (this.churnRisk < 0.3) return 'active';
  if (this.churnRisk < 0.7) return 'at_risk';
  return 'churned';
};

module.exports = mongoose.model('Customer', customerSchema);