import React from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  customers: any[];
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ customers, loading }) => {
  // Calculate metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const atRiskCustomers = customers.filter(c => c.status === 'at_risk').length;
  const churnedCustomers = customers.filter(c => c.status === 'churned').length;
  const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers * 100).toFixed(1) : 0;
  const avgRevenue = customers.length > 0 ? 
    (customers.reduce((sum, c) => sum + c.subscriptionValue, 0) / customers.length).toFixed(0) : 0;

  // Risk distribution data
  const riskData = [
    { name: 'Low Risk', value: customers.filter(c => c.churnRisk < 0.3).length, color: '#10B981' },
    { name: 'Medium Risk', value: customers.filter(c => c.churnRisk >= 0.3 && c.churnRisk < 0.7).length, color: '#F59E0B' },
    { name: 'High Risk', value: customers.filter(c => c.churnRisk >= 0.7).length, color: '#EF4444' }
  ];

  // Monthly trend data (mock data for visualization)
  const trendData = [
    { month: 'Jan', customers: 120, churnRate: 12 },
    { month: 'Feb', customers: 135, churnRate: 10 },
    { month: 'Mar', customers: 145, churnRate: 8 },
    { month: 'Apr', customers: 160, churnRate: 15 },
    { month: 'May', customers: 155, churnRate: 12 },
    { month: 'Jun', customers: 170, churnRate: 9 }
  ];

  // Support tickets by risk level
  const supportData = [
    { risk: 'Low', tickets: customers.filter(c => c.churnRisk < 0.3).reduce((sum, c) => sum + c.supportTickets, 0) },
    { risk: 'Medium', tickets: customers.filter(c => c.churnRisk >= 0.3 && c.churnRisk < 0.7).reduce((sum, c) => sum + c.supportTickets, 0) },
    { risk: 'High', tickets: customers.filter(c => c.churnRisk >= 0.7).reduce((sum, c) => sum + c.supportTickets, 0) }
  ];

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendUp }: any) => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
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

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          subtitle={`${activeCustomers} active customers`}
          icon={Users}
          trend="5.2%"
          trendUp={true}
        />
        <MetricCard
          title="Churn Rate"
          value={`${churnRate}%`}
          subtitle={`${churnedCustomers} churned this month`}
          icon={TrendingUp}
          trend="2.1%"
          trendUp={false}
        />
        <MetricCard
          title="At Risk"
          value={atRiskCustomers}
          subtitle="Customers need attention"
          icon={AlertTriangle}
          trend="12"
          trendUp={false}
        />
        <MetricCard
          title="Avg Revenue"
          value={`$${Number(avgRevenue).toLocaleString()}`}
          subtitle="Per customer monthly"
          icon={DollarSign}
          trend="8.5%"
          trendUp={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Distribution */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Customer Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Customers']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {riskData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Churn Trends
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
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
              <Line 
                type="monotone" 
                dataKey="churnRate" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Support Tickets by Risk Level */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
          Support Tickets by Risk Level
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={supportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="risk" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: 'none', 
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
              }} 
            />
            <Bar 
              dataKey="tickets" 
              fill="url(#colorGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent High-Risk Customers */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          High-Risk Customers Requiring Immediate Attention
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Risk Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .filter(customer => customer.churnRisk >= 0.7)
                .slice(0, 5)
                .map((customer, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{customer.company}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {(customer.churnRisk * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      ${customer.subscriptionValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(customer.lastActivity).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;