import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats } from '../admin-store/slices/adminSlice';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Eye } from 'lucide-react';

const Analytics = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sample data for charts (in a real app, this would come from your backend)
  const salesData = [
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 19000 },
    { month: 'Mar', sales: 15000 },
    { month: 'Apr', sales: 25000 },
    { month: 'May', sales: 22000 },
    { month: 'Jun', sales: 30000 },
  ];

  const categoryData = [
    { name: 'Electronics', percentage: 35, color: 'bg-blue-500' },
    { name: 'Clothing', percentage: 25, color: 'bg-green-500' },
    { name: 'Home & Garden', percentage: 20, color: 'bg-yellow-500' },
    { name: 'Sports', percentage: 15, color: 'bg-purple-500' },
    { name: 'Books', percentage: 5, color: 'bg-red-500' },
  ];

  const MetricCard = ({ 
    icon: Icon, 
    title, 
    value, 
    change, 
    color 
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
        <span className="text-sm text-gray-600 ml-1">from last month</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Eye className="h-4 w-4" />
          <span>Real-time data</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          change="+15.2%"
          color="bg-green-600"
        />
        <MetricCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats?.totalOrders?.toString() || '0'}
          change="+8.1%"
          color="bg-blue-600"
        />
        <MetricCard
          icon={Users}
          title="Total Customers"
          value={stats?.totalUsers?.toString() || '0'}
          change="+12.5%"
          color="bg-purple-600"
        />
        <MetricCard
          icon={Package}
          title="Products Sold"
          value="1,245"
          change="+6.3%"
          color="bg-orange-600"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          
          <div className="space-y-4">
            {salesData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{data.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(data.sales / 30000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-[60px]">
                    ${data.sales.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Products</h3>
          
          <div className="space-y-4">
            {stats?.topProducts?.slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.totalSold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${product.revenue}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Category Distribution and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Category</h3>
          
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${category.color}`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Summary</h3>
          
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Sales Growth</h4>
                  <p className="text-sm text-gray-600">15.2% increase this month</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Customer Acquisition</h4>
                  <p className="text-sm text-gray-600">142 new customers this month</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Best Seller</h4>
                  <p className="text-sm text-gray-600">Wireless Headphones (89 sold)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;