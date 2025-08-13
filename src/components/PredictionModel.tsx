import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Settings, 
  Play, 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Target,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface PredictionModelProps {
  customers: any[];
  setCustomers: (customers: any[]) => void;
}

const PredictionModel: React.FC<PredictionModelProps> = ({ customers, setCustomers }) => {
  const [modelStatus, setModelStatus] = useState('ready');
  const [isTraining, setIsTraining] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 87.3,
    precision: 84.2,
    recall: 89.1,
    f1Score: 86.6
  });

  // Model configuration
  const [modelConfig, setModelConfig] = useState({
    algorithm: 'random_forest',
    features: {
      loginFrequency: true,
      supportTickets: true,
      subscriptionValue: true,
      contractLength: true,
      lastActivity: true,
      productUsage: true
    },
    threshold: 0.7,
    trainingSize: 0.8
  });

  // Performance data for charts
  const performanceHistory = [
    { date: '2024-01', accuracy: 82.1, predictions: 145 },
    { date: '2024-02', accuracy: 84.5, predictions: 162 },
    { date: '2024-03', accuracy: 86.2, predictions: 178 },
    { date: '2024-04', accuracy: 87.3, predictions: 189 },
    { date: '2024-05', accuracy: 87.1, predictions: 195 },
    { date: '2024-06', accuracy: 87.8, predictions: 201 }
  ];

  const featureImportance = [
    { feature: 'Login Frequency', importance: 0.23 },
    { feature: 'Support Tickets', importance: 0.19 },
    { feature: 'Last Activity', importance: 0.18 },
    { feature: 'Subscription Value', importance: 0.15 },
    { feature: 'Contract Length', importance: 0.13 },
    { feature: 'Product Usage', importance: 0.12 }
  ];

  const runPredictions = async () => {
    setIsTraining(true);
    setModelStatus('training');

    try {
      // Simulate model training and prediction
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Calculate predictions for all customers
      const updatedCustomers = customers.map(customer => {
        const churnRisk = calculateChurnRisk(customer);
        const riskLevel = churnRisk < 0.3 ? 'low' : churnRisk < 0.7 ? 'medium' : 'high';
        
        return {
          ...customer,
          churnRisk,
          status: churnRisk >= 0.7 ? 'at_risk' : churnRisk >= 0.3 ? 'at_risk' : 'active',
          lastPrediction: new Date()
        };
      });

      setCustomers(updatedCustomers);
      
      // Generate prediction summary
      const newPredictions = updatedCustomers.map(customer => ({
        customerId: customer.id,
        customerName: customer.name,
        churnRisk: customer.churnRisk,
        riskLevel: customer.churnRisk < 0.3 ? 'low' : customer.churnRisk < 0.7 ? 'medium' : 'high',
        factors: getChurnFactors(customer),
        timestamp: new Date()
      }));

      setPredictions(newPredictions);
      setModelStatus('ready');
      
      // Simulate slight improvement in metrics
      setModelMetrics(prev => ({
        accuracy: Math.min(prev.accuracy + Math.random() * 2, 95),
        precision: Math.min(prev.precision + Math.random() * 2, 95),
        recall: Math.min(prev.recall + Math.random() * 2, 95),
        f1Score: Math.min(prev.f1Score + Math.random() * 2, 95)
      }));

    } catch (error) {
      console.error('Error running predictions:', error);
      setModelStatus('error');
    } finally {
      setIsTraining(false);
    }
  };

  const calculateChurnRisk = (customer: any) => {
    const weights = {
      daysSinceLastLogin: 0.23,
      supportTickets: 0.19,
      loginFrequency: -0.18,
      subscriptionValue: -0.15,
      contractLength: -0.13,
      productUsage: -0.12
    };

    let risk = 0.5; // Base risk

    // Days since last login
    const daysSince = Math.floor((new Date().getTime() - new Date(customer.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    risk += Math.min(daysSince / 30, 1) * weights.daysSinceLastLogin;

    // Support tickets impact
    risk += Math.min(customer.supportTickets / 20, 1) * weights.supportTickets;

    // Login frequency (higher = lower risk)
    risk += (1 - Math.min(customer.loginFrequency / 30, 1)) * Math.abs(weights.loginFrequency);

    // Subscription value (higher = lower risk)
    risk += (1 - Math.min(customer.subscriptionValue / 10000, 1)) * Math.abs(weights.subscriptionValue);

    // Contract length (longer = lower risk)
    risk += (1 - Math.min(customer.contractLength / 36, 1)) * Math.abs(weights.contractLength);

    // Product usage (if available)
    const usage = customer.features?.productUsage || Math.random() * 100;
    risk += (1 - Math.min(usage / 100, 1)) * Math.abs(weights.productUsage);

    return Math.max(0, Math.min(1, risk));
  };

  const getChurnFactors = (customer: any) => {
    const factors = [];
    
    const daysSince = Math.floor((new Date().getTime() - new Date(customer.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 14) factors.push('Inactive user (14+ days)');
    if (customer.supportTickets > 10) factors.push('High support volume');
    if (customer.loginFrequency < 5) factors.push('Low engagement');
    if (customer.contractLength < 12) factors.push('Short contract');
    if (customer.subscriptionValue < 1000) factors.push('Low value customer');
    
    return factors;
  };

  const ModelStatusCard = () => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          Model Status
        </h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
          modelStatus === 'ready' ? 'bg-green-100 text-green-700' :
          modelStatus === 'training' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {modelStatus === 'ready' && <CheckCircle className="w-4 h-4" />}
          {modelStatus === 'training' && <RefreshCw className="w-4 h-4 animate-spin" />}
          {modelStatus === 'error' && <AlertCircle className="w-4 h-4" />}
          <span className="capitalize">{modelStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{modelMetrics.accuracy.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Accuracy</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{modelMetrics.precision.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Precision</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{modelMetrics.recall.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Recall</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{modelMetrics.f1Score.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">F1 Score</p>
        </div>
      </div>

      <button
        onClick={runPredictions}
        disabled={isTraining}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
      >
        {isTraining ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
        <span>{isTraining ? 'Training Model...' : 'Run Predictions'}</span>
      </button>
    </div>
  );

  const ConfigurationPanel = () => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-blue-600" />
        Model Configuration
      </h3>

      <div className="space-y-6">
        {/* Algorithm Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
          <select
            value={modelConfig.algorithm}
            onChange={(e) => setModelConfig({ ...modelConfig, algorithm: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="random_forest">Random Forest</option>
            <option value="gradient_boosting">Gradient Boosting</option>
            <option value="neural_network">Neural Network</option>
            <option value="svm">Support Vector Machine</option>
          </select>
        </div>

        {/* Feature Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
          <div className="space-y-2">
            {Object.entries(modelConfig.features).map(([feature, enabled]) => (
              <label key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enabled as boolean}
                  onChange={(e) => setModelConfig({
                    ...modelConfig,
                    features: { ...modelConfig.features, [feature]: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Churn Risk Threshold: {modelConfig.threshold}
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={modelConfig.threshold}
            onChange={(e) => setModelConfig({ ...modelConfig, threshold: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Training Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Training Data Size: {Math.round(modelConfig.trainingSize * 100)}%
          </label>
          <input
            type="range"
            min="0.6"
            max="0.9"
            step="0.1"
            value={modelConfig.trainingSize}
            onChange={(e) => setModelConfig({ ...modelConfig, trainingSize: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Model Status and Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ModelStatusCard />
        <ConfigurationPanel />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Performance History */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            Model Performance History
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" domain={[75, 95]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Importance */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-600" />
            Feature Importance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis dataKey="feature" type="category" stroke="#6B7280" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                }}
                formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
              />
              <Bar dataKey="importance" fill="#6366F1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-600" />
          Recent Predictions
        </h3>
        
        {predictions.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No predictions generated yet</p>
            <p className="text-sm text-gray-400">Click "Run Predictions" to generate churn risk assessments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Risk Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Risk Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Key Factors</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {predictions.slice(0, 10).map((prediction: any, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{prediction.customerName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prediction.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                        prediction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {prediction.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {(prediction.churnRisk * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {prediction.factors.slice(0, 2).map((factor: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {factor}
                          </span>
                        ))}
                        {prediction.factors.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{prediction.factors.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {new Date(prediction.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionModel;