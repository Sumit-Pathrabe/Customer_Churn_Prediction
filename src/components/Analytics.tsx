import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  Users,
  DollarSign
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface AnalyticsProps {
  customers: any[];
  loading: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ customers, loading }) => {
  const analyticsData = useMemo(() => {
    // Churn by subscription value ranges
    const valueRanges = [
      { range: '$0-1K', min: 0, max: 1000 },
      { range: '$1K-3K', min: 1000, max: 3000 },
      { range: '$3K-5K', min: 3000, max: 5000 },
      { range: '$5K-10K', min: 5000, max: 10000 },
      { range: '$10K+', min: 10000, max: Infinity }
    ];

    const churnByValue = valueRanges.map(range => {
      const customersInRange = customers.filter(c => 
        c.subscriptionValue >= range.min && c.subscriptionValue < range.max
      );
      const churnedInRange = customersInRange.filter(c => c.status === 'churned');
      
      return {
        range: range.range,
        totalCustomers: customersInRange.length,
        churnedCustomers: churnedInRange.length,
        churnRate: customersInRange.length > 0 ? 
          (churnedInRange.length / customersInRange.length * 100).toFixed(1) : 0
      };
    });

    // Risk vs Contract Length scatter plot
    const riskVsContract = customers.map(customer => ({
      contractLength: customer.contractLength,
      churnRisk: customer.churnRisk * 100,
      subscriptionValue: customer.subscriptionValue,
      name: customer.name
    }));

    // Support tickets impact
    const supportImpact = [
      { tickets: '0-2', customers: customers.filter(c => c.supportTickets <= 2) },
      { tickets: '3-5', customers: customers.filter(c => c.supportTickets >= 3 && c.supportTickets <= 5) },
      { tickets: '6-10', customers: customers.filter(c => c.supportTickets >= 6 && c.supportTickets <= 10) },
      { tickets: '10+', customers: customers.filter(c => c.supportTickets > 10) }
    ].map(group => ({
      tickets: group.tickets,
      avgRisk: group.customers.length > 0 ? 
        (group.customers.reduce((sum, c) => sum + c.churnRisk, 0) / group.customers.length * 100).toFixed(1) : 0,
      count: group.customers.length
    }));

    // Monthly cohort analysis (mock data for demonstration)
    const cohortData = [
      { month: 'Jan', newCustomers: 45, retained: 42, churnRate: 6.7 },
      { month: 'Feb', newCustomers: 52, retained: 48, churnRate: 7.7 },
      { month: 'Mar', newCustomers: 38, retained: 36, churnRate: 5.3 },
      { month: 'Apr', newCustomers: 61, retained: 55, churnRate: 9.8 },
      { month: 'May', newCustomers: 47, retained: 44, churnRate: 6.4 },
      { month: 'Jun', newCustomers: 55, retained: 51, churnRate: 7.3 }
    ];

    // Feature importance radar chart
    const featureImportance = [
      { feature: 'Login Frequency', importance: 85 },
      { feature: 'Support Tickets', importance: 78 },
      { feature: 'Contract Length', importance: 65 },
      { feature: 'Subscription Value', importance: 72 },
      { feature: 'Last Activity', importance: 88 },
      { feature: 'Product Usage', importance: 74 }
    ];

    return {
      churnByValue,
      riskVsContract: riskVsContract.slice(0, 50), // Limit for performance
      supportImpact,
      cohortData,
      featureImportance
    };
  }, [customers]);

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }: any) => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="text-right">
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <p className="text-xs text-gray-500">vs last month</p>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const avgRisk = customers.length > 0 ? 
    (customers.reduce((sum, c) => sum + c.churnRisk, 0) / customers.length * 100).toFixed(1) : 0;
  const highRiskCount = customers.filter(c => c.churnRisk >= 0.7).length;
  const avgRevenue = customers.length > 0 ? 
    (customers.reduce((sum, c) => sum + c.subscriptionValue, 0) / customers.length).toFixed(0) : 0;

  return (
    <div className="space-y-8">
      {/* Key Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Average Risk Score"
          value={`${avgRisk}%`}
          subtitle="Across all customers"
          icon={Target}
          trend={-2.3}
          color="red"
        />
        <MetricCard
          title="High Risk Customers"
          value={highRiskCount}
          subtitle="Requiring immediate attention"
          icon={Users}
          trend={5.1}
          color="orange"
        />
        <MetricCard
          title="Revenue at Risk"
          value={`$${(customers.filter(c => c.churnRisk >= 0.7).reduce((sum, c) => sum + c.subscriptionValue, 0) / 1000).toFixed(0)}K`}
          subtitle="From high-risk customers"
          icon={DollarSign}
          trend={-8.2}
          color="green"
        />
        <MetricCard
          title="Prediction Accuracy"
          value="87.3%"
          subtitle="Model performance score"
          icon={Award}
          trend={1.8}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Churn Rate by Subscription Value */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Churn Rate by Subscription Value
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.churnByValue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="range" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                }} 
              />
              <Bar dataKey="churnRate" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Support Tickets Impact */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Support Tickets vs Churn Risk
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.supportImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="tickets" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
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
                dataKey="avgRisk" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk vs Contract Length Scatter Plot */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-600" />
          Churn Risk vs Contract Length Analysis
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={analyticsData.riskVsContract}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="contractLength" 
              stroke="#6B7280"
              label={{ value: 'Contract Length (months)', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              stroke="#6B7280"
              label={{ value: 'Churn Risk (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: 'none', 
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
              }}
              formatter={(value, name) => [
                name === 'churnRisk' ? `${value}%` : 
                name === 'subscriptionValue' ? `$${value}` : value,
                name === 'churnRisk' ? 'Churn Risk' :
                name === 'subscriptionValue' ? 'Subscription Value' : name
              ]}
            />
            <Scatter dataKey="churnRisk" fill="#8B5CF6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Importance & Cohort Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature Importance Radar */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-600" />
            Feature Importance in Prediction Model
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analyticsData.featureImportance}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
              />
              <Radar
                name="Importance"
                dataKey="importance"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Cohort Analysis */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-teal-600" />
            Monthly Cohort Retention Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.cohortData}>
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorRetained" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                }} 
              />
              <Area
                type="monotone"
                dataKey="newCustomers"
                stackId="1"
                stroke="#10B981"
                fill="url(#colorNew)"
              />
              <Area
                type="monotone"
                dataKey="retained"
                stackId="2"
                stroke="#3B82F6"
                fill="url(#colorRetained)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Summary */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-600" />
          Key Insights & Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Revenue Protection</h4>
            <p className="text-sm text-green-700">
              Focus on customers with 10+ support tickets - they have 40% higher churn risk but represent significant revenue.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Contract Strategy</h4>
            <p className="text-sm text-blue-700">
              Customers with contracts shorter than 12 months show 25% higher churn rates. Consider incentivizing longer terms.
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Engagement Impact</h4>
            <p className="text-sm text-orange-700">
              Login frequency is the strongest predictor. Implement engagement campaigns for inactive users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;