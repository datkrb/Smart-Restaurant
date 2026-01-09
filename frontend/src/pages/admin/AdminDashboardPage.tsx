import React from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  UserPlus, 
  Settings as SettingsIcon,
  ShoppingBag,
  QrCode,
  Clock,
  TrendingUp,
  MoreVertical,
  AlertTriangle,
  Info,
  Clock3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '../../components/common/Button';

// Mock Data for Chart
const data = [
  { name: '00:00', load: 30 },
  { name: '04:00', load: 20 },
  { name: '08:00', load: 45 },
  { name: '12:00', load: 80 },
  { name: '16:00', load: 60 },
  { name: '20:00', load: 90 },
  { name: '23:59', load: 50 },
];

const AdminDashboardPage = () => {
  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary" leftIcon={<ShoppingBag size={18} />}>
          Add New Restaurant
        </Button>
        <Button variant="outline" className="bg-white" leftIcon={<UserPlus size={18} />}>
          Create Admin
        </Button>
        <Button variant="outline" className="bg-white" leftIcon={<SettingsIcon size={18} />}>
          System Config
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Restaurants', value: '1,248', change: '+5.2%', trend: 'up', icon: <ShoppingBag className="text-primary" /> },
          { label: 'Active Scans (Today)', value: '8,432', change: '+12%', trend: 'up', icon: <QrCode className="text-green-500" /> },
          { label: 'Pending Approvals', value: '14', change: 'Action Required', trend: 'neutral', icon: <Clock className="text-orange-400" />, highlight: true },
          { label: 'Monthly Revenue', value: '$45,200', change: '+8.4%', trend: 'up', icon: <TrendingUp className="text-blue-500" /> },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-border-light shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-secondary text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-text-main mt-1">{stat.value}</h3>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : stat.highlight ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-text-secondary">{stat.trend === 'up' ? 'vs last month' : stat.highlight ? '' : 'peak hours'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Recent Registrations */}
        <div className="flex-1 bg-white rounded-xl border border-border-light shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-main">Recent Registrations</h3>
              <p className="text-sm text-text-secondary">New restaurants awaiting or recently approved.</p>
            </div>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-text-secondary uppercase border-b border-border-light">
                  <th className="font-semibold py-3">Restaurant Name</th>
                  <th className="font-semibold py-3">Owner Email</th>
                  <th className="font-semibold py-3">Date</th>
                  <th className="font-semibold py-3">Status</th>
                  <th className="font-semibold py-3">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Burger Haven', email: 'john.doe@burger.com', date: 'Oct 24, 2023', status: 'Pending' },
                  { name: 'Sapore Italiano', email: 'mario@sapore.it', date: 'Oct 23, 2023', status: 'Active' },
                  { name: 'Tokyo Sushi', email: 'kenji@tokyo.jp', date: 'Oct 23, 2023', status: 'Active' },
                  { name: 'The Green Bowl', email: 'sarah@greenbowl.co', date: 'Oct 22, 2023', status: 'Rejected' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border-light last:border-none hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-text-main flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                        {row.name.charAt(0)}
                      </div>
                      {row.name}
                    </td>
                    <td className="py-4 text-text-secondary">{row.email}</td>
                    <td className="py-4 text-text-secondary">{row.date}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        row.status === 'Active' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 text-text-secondary">
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Charts & Alerts Side Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          
          {/* System Load Chart */}
          <div className="bg-white rounded-xl border border-border-light shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-text-main">System Load</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">HEALTHY</span>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold text-text-main">32%</span>
              <p className="text-xs text-text-secondary">Avg load last 1h</p>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec6d13" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec6d13" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip />
                  <Area type="monotone" dataKey="load" stroke="#ec6d13" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-xl border border-border-light shadow-sm p-6">
            <h3 className="font-bold text-text-main mb-4">System Alerts</h3>
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-red-50 text-red-700 rounded-lg flex gap-3 items-start">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Database Latency Spike</p>
                  <p className="text-xs opacity-80 mt-0.5">15 mins ago • US-East-1</p>
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg flex gap-3 items-start">
                <Info size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Payment Gateway Warning</p>
                  <p className="text-xs opacity-80 mt-0.5">2 hrs ago • Stripe Connect</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg flex gap-3 items-start">
                <Clock3 size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">System Update Scheduled</p>
                  <p className="text-xs opacity-80 mt-0.5">Tomorrow, 02:00 AM UTC</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
