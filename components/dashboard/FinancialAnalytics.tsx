'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Filter,
  Crop,
  Seedling,
  Truck,
  Wrench,
  Users
} from 'lucide-react';

interface FinancialData {
  period: string;
  income: number;
  expenses: number;
  profit: number;
  profitMargin: number;
}

interface CropRevenue {
  crop: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalRevenue: number;
  costOfProduction: number;
  profit: number;
  profitMargin: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface BudgetItem {
  category: string;
  budgeted: number;
  actual: number;
  remaining: number;
  status: 'under' | 'over' | 'on-track';
}

export function FinancialAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [selectedView, setSelectedView] = useState('overview');

  const financialData: FinancialData[] = [
    { period: '2024', income: 1250000, expenses: 850000, profit: 400000, profitMargin: 32 },
    { period: '2023', income: 1100000, expenses: 780000, profit: 320000, profitMargin: 29 },
    { period: '2022', income: 980000, expenses: 720000, profit: 260000, profitMargin: 27 },
  ];

  const cropRevenue: CropRevenue[] = [
    {
      crop: 'Wheat',
      quantity: 450,
      unit: 'tons',
      pricePerUnit: 2450,
      totalRevenue: 1102500,
      costOfProduction: 720000,
      profit: 382500,
      profitMargin: 35
    },
    {
      crop: 'Corn',
      quantity: 320,
      unit: 'tons',
      pricePerUnit: 1850,
      totalRevenue: 592000,
      costOfProduction: 420000,
      profit: 172000,
      profitMargin: 29
    },
    {
      crop: 'Soybeans',
      quantity: 280,
      unit: 'tons',
      pricePerUnit: 3200,
      totalRevenue: 896000,
      costOfProduction: 580000,
      profit: 316000,
      profitMargin: 35
    },
    {
      crop: 'Rice',
      quantity: 180,
      unit: 'tons',
      pricePerUnit: 2800,
      totalRevenue: 504000,
      costOfProduction: 320000,
      profit: 184000,
      profitMargin: 37
    }
  ];

  const expenseCategories: ExpenseCategory[] = [
    { category: 'Labor', amount: 320000, percentage: 38, trend: 'up' },
    { category: 'Fertilizers', amount: 180000, percentage: 21, trend: 'down' },
    { category: 'Pesticides', amount: 95000, percentage: 11, trend: 'stable' },
    { category: 'Irrigation', amount: 85000, percentage: 10, trend: 'up' },
    { category: 'Equipment', amount: 75000, percentage: 9, trend: 'down' },
    { category: 'Seeds', amount: 65000, percentage: 8, trend: 'stable' },
    { category: 'Other', amount: 30000, percentage: 3, trend: 'up' }
  ];

  const budgetItems: BudgetItem[] = [
    { category: 'Labor', budgeted: 300000, actual: 320000, remaining: -20000, status: 'over' },
    { category: 'Fertilizers', budgeted: 200000, actual: 180000, remaining: 20000, status: 'under' },
    { category: 'Pesticides', budgeted: 100000, actual: 95000, remaining: 5000, status: 'under' },
    { category: 'Irrigation', budgeted: 80000, actual: 85000, remaining: -5000, status: 'over' },
    { category: 'Equipment', budgeted: 80000, actual: 75000, remaining: 5000, status: 'under' },
    { category: 'Seeds', budgeted: 70000, actual: 65000, remaining: 5000, status: 'under' }
  ];

  const currentData = financialData.find(data => data.period === selectedPeriod) || financialData[0];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'under': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'over': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'on-track': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Track income, expenses, and profitability</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(currentData.income)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+12.5% vs last year</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(currentData.expenses)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">+8.2% vs last year</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-500">
                <Calculator className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentData.profit)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">+25.3% vs last year</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-600">{currentData.profitMargin}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600">+3.2% vs last year</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crop Revenue Analysis */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-5 rounded-bl-full" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 shadow-md">
              <Crop className="w-5 h-5 text-white" />
            </div>
            Crop Revenue Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Crop</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Quantity</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Price/Unit</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Cost</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Profit</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Margin</th>
                </tr>
              </thead>
              <tbody>
                {cropRevenue.map((crop) => (
                  <tr key={crop.crop} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Seedling className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900 dark:text-white">{crop.crop}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatNumber(crop.quantity)} {crop.unit}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatCurrency(crop.pricePerUnit)}
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-green-600">
                      {formatCurrency(crop.totalRevenue)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatCurrency(crop.costOfProduction)}
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-blue-600">
                      {formatCurrency(crop.profit)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {crop.profitMargin}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown & Budget Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-pink-500 opacity-5 rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-pink-500 shadow-md">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {expenseCategories.map((expense) => (
                <div key={expense.category} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{expense.category}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{expense.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(expense.trend)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {expense.trend === 'up' ? 'Increasing' : expense.trend === 'down' ? 'Decreasing' : 'Stable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-5 rounded-bl-full" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
                <Target className="w-5 h-5 text-white" />
              </div>
              Budget Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {budgetItems.map((item) => (
                <div key={item.category} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
                    <Badge className={getBudgetStatusColor(item.status)}>
                      {item.status === 'under' ? 'Under Budget' : item.status === 'over' ? 'Over Budget' : 'On Track'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Budgeted</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.budgeted)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Actual</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.actual)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Remaining</p>
                      <p className={`font-medium ${item.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.remaining)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Insights */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-5 rounded-bl-full" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Top Performer</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rice crop shows the highest profit margin at 37%, making it your most profitable crop this season.
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Cost Alert</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Labor costs are 6.7% over budget. Consider optimizing workforce allocation for better efficiency.
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Growth Trend</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overall profit increased by 25.3% compared to last year, driven by higher crop yields and better pricing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 