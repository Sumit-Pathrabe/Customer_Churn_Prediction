import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import Analytics from './components/Analytics';
import PredictionModel from './components/PredictionModel';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'model', label: 'Prediction Model', icon: AlertTriangle },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // For demo purposes, use mock data
      setCustomers(generateMockCustomers());
    }
    setLoading(false);
  };

  const generateMockCustomers = () => {
    const customers = [];
    const names = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'Christopher Lee', 'Amanda Thompson'];
    const companies = ['TechCorp', 'DataSystems', 'CloudWorks', 'FinanceBase', 'RetailMax', 'HealthTech', 'EduSoft', 'MediaGroup', 'LogisticsPro', 'ConsultingFirm'];
    
    for (let i = 0; i < 50; i++) {
      customers.push({
        id: `customer_${i + 1}`,
        name: names[i % names.length],
        email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@${companies[i % companies.length].toLowerCase()}.com`,
        company: companies[i % companies.length],
        subscriptionValue: Math.floor(Math.random() * 10000) + 500,
        lastActivity: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        supportTickets: Math.floor(Math.random() * 20),
        loginFrequency: Math.floor(Math.random() * 30) + 1,
        contractLength: Math.floor(Math.random() * 36) + 6,
        churnRisk: Math.random(),
        status: Math.random() > 0.2 ? 'active' : 'churned',
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      });
    }
    return customers;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard customers={customers} loading={loading} />;
      case 'customers':
        return <CustomerList customers={customers} setCustomers={setCustomers} loading={loading} />;
      case 'analytics':
        return <Analytics customers={customers} loading={loading} />;
      case 'model':
        return <PredictionModel customers={customers} setCustomers={setCustomers} />;
      default:
        return <Dashboard customers={customers} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/70 backdrop-blur-md border-r border-white/20 shadow-xl min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">ChurnPredict</h1>
                <p className="text-xs text-gray-500">AI-Powered Analytics</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600">
                  {activeTab === 'dashboard' && 'Monitor your customer churn metrics and predictions'}
                  {activeTab === 'customers' && 'Manage and analyze your customer database'}
                  {activeTab === 'analytics' && 'Deep dive into churn patterns and trends'}
                  {activeTab === 'model' && 'Configure and optimize your prediction model'}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchCustomers}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-xl text-gray-700 hover:bg-white/90 transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;