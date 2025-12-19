'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import Link from 'next/link'
import { Package, ShoppingCart, Receipt, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuthStore()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </motion.div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Pantry',
      description: 'View products in your pantry',
      href: '/dashboard/pantry',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      hoverGradient: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Shopping List',
      description: 'Create a new shopping list',
      href: '/dashboard/shopping',
      icon: ShoppingCart,
      gradient: 'from-green-500 to-emerald-500',
      hoverGradient: 'from-green-600 to-emerald-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Return Shopping',
      description: 'Update pantry after shopping',
      href: '/dashboard/return-shopping',
      icon: Receipt,
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Analytics',
      description: 'View insights and statistics',
      href: '/dashboard/profitability',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-amber-500',
      hoverGradient: 'from-orange-600 to-amber-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Welcome Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Welcome, {user.user_metadata?.username || user.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-gray-600 text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                What would you like to do today?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.href}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={action.href}
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 block"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`${action.iconBg} group-hover:bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300`}>
                      <Icon className={`w-7 h-7 text-gray-700 group-hover:text-white transition-colors duration-300`} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-white mb-2 transition-colors duration-300">
                      {action.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                      {action.description}
                    </p>
                    
                    {/* Arrow Icon */}
                    <div className="mt-4 flex items-center text-blue-600 group-hover:text-white transition-colors duration-300">
                      <span className="text-sm font-medium">View Details</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Products in Pantry</p>
                <p className="text-3xl font-bold text-gray-800">0</p>
              </div>
              <Package className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Shopping Lists</p>
                <p className="text-3xl font-bold text-gray-800">0</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Savings</p>
                <p className="text-3xl font-bold text-gray-800">$0</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-50" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
