'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Package, 
  ShoppingCart, 
  Receipt, 
  TrendingUp, 
  Settings, 
  ArrowRight,
  Plus,
  BarChart3,
  Sparkles
} from 'lucide-react'

const dashboardCards = [
  {
    href: '/dashboard/pantry',
    title: 'Pantry',
    description: 'View and manage your inventory',
    icon: Package,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    href: '/dashboard/pantry/add',
    title: 'Add Items',
    description: 'Add new items to your pantry',
    icon: Plus,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
  },
  {
    href: '/dashboard/shopping',
    title: 'Shopping List',
    description: 'Create and manage shopping lists',
    icon: ShoppingCart,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    href: '/dashboard/shopping-active',
    title: 'Active Shopping',
    description: 'Track your current shopping trip',
    icon: ArrowRight,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    href: '/dashboard/return-shopping',
    title: 'Return Shopping',
    description: 'Scan receipts and update inventory',
    icon: Receipt,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    href: '/dashboard/habits',
    title: 'Habits & Preferences',
    description: 'Manage your preferences and habits',
    icon: Settings,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    href: '/dashboard/profitability',
    title: 'Analytics',
    description: 'View spending and usage analytics',
    icon: TrendingUp,
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuthStore()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your smart pantry with ease
          </p>
        </motion.div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={card.href}>
                  <div className={`${card.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-gray-200`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {card.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      <span>Open</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Stats Section (Optional - can be expanded later) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Quick Overview</h2>
          </div>
          <p className="text-gray-600">
            Your pantry management dashboard. Use the cards above to navigate to different sections.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

