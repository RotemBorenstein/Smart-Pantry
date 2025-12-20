'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { api } from '@/lib/api'
import { Package, Trash2, RefreshCw, Plus, TrendingUp, Clock } from 'lucide-react'
import axios from 'axios'

interface InventoryItem {
  product_id: string
  product_name: string
  state: 'EMPTY' | 'LOW' | 'MEDIUM' | 'FULL' | 'UNKNOWN'
  estimated_qty: number | null
  confidence: number
  displayed_name: string | null
  // Prediction data
  prediction?: {
    expected_days_left: number
    predicted_state: string
    confidence: number
    stock_percentage: number
  }
}

const getStockPercentage = (state: string): number => {
  switch (state) {
    case 'FULL': return 100
    case 'MEDIUM': return 50
    case 'LOW': return 25
    case 'EMPTY': return 0
    default: return 0
  }
}

const getStockLabel = (state: string): string => {
  switch (state) {
    case 'FULL': return 'HIGH'
    case 'MEDIUM': return 'MEDIUM'
    case 'LOW': return 'LOW'
    case 'EMPTY': return 'EMPTY'
    case 'UNKNOWN': return 'MEDIUM' // Default UNKNOWN to MEDIUM
    default: return 'MEDIUM'
  }
}

const getColorFromState = (state: string): string => {
  switch (state) {
    case 'FULL': return 'from-green-500 to-emerald-500'
    case 'MEDIUM': return 'from-blue-500 to-cyan-500'
    case 'LOW': return 'from-orange-500 to-amber-500'
    case 'EMPTY': return 'from-red-500 to-rose-500'
    default: return 'from-gray-500 to-gray-600'
  }
}

const getTextColorFromState = (state: string): string => {
  switch (state) {
    case 'FULL': return 'text-green-600'
    case 'MEDIUM': return 'text-blue-600'
    case 'LOW': return 'text-orange-600'
    case 'EMPTY': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

const getBgColorFromState = (state: string): string => {
  switch (state) {
    case 'FULL': return 'bg-green-100'
    case 'MEDIUM': return 'bg-blue-100'
    case 'LOW': return 'bg-orange-100'
    case 'EMPTY': return 'bg-red-100'
    default: return 'bg-gray-100'
  }
}

export default function PantryPage() {
  const router = useRouter()
  const { user, loading } = useAuthStore()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loadingInventory, setLoadingInventory] = useState(true)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadInventory()
    }
  }, [user])

  const loadInventory = async () => {
    try {
      setLoadingInventory(true)
      const response = await api.get(`/inventory?user_id=${user?.id}`)
      const inventoryData = response.data
      
      // Load predictions for each item
      const inventoryWithPredictions = await Promise.all(
        inventoryData.map(async (item: InventoryItem) => {
          try {
            const predictionResponse = await axios.get(
              `http://localhost:8000/api/v1/predictor/forecast/${user?.id}/${item.product_id}`
            )
            const prediction = predictionResponse.data
            
            // If prediction exists, use it
            if (prediction && prediction.predicted_state && prediction.predicted_state !== 'UNKNOWN') {
              return {
                ...item,
                prediction: {
                  expected_days_left: prediction.expected_days_left || 0,
                  predicted_state: prediction.predicted_state,
                  confidence: prediction.confidence || 0,
                  stock_percentage: getStockPercentage(prediction.predicted_state)
                }
              }
            } else {
              // No valid prediction - use current inventory state
              return {
                ...item,
                prediction: {
                  expected_days_left: 0,
                  predicted_state: item.state !== 'UNKNOWN' ? item.state : 'MEDIUM', // Default to MEDIUM if unknown
                  confidence: item.confidence,
                  stock_percentage: getStockPercentage(item.state !== 'UNKNOWN' ? item.state : 'MEDIUM')
                }
              }
            }
          } catch (error) {
            // If no prediction or error, use current state
            return {
              ...item,
              prediction: {
                expected_days_left: 0,
                predicted_state: item.state !== 'UNKNOWN' ? item.state : 'MEDIUM', // Default to MEDIUM if unknown
                confidence: item.confidence,
                stock_percentage: getStockPercentage(item.state !== 'UNKNOWN' ? item.state : 'MEDIUM')
              }
            }
          }
        })
      )
      
      setInventory(inventoryWithPredictions)
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoadingInventory(false)
    }
  }

  const handleDecrease = async (item: InventoryItem) => {
    const states = ['FULL', 'MEDIUM', 'LOW', 'EMPTY']
    const stateLabels = ['HIGH', 'MEDIUM', 'LOW', 'EMPTY']
    const currentIndex = states.indexOf(item.state)
    if (currentIndex < states.length - 1) {
      const newState = states[currentIndex + 1]
      const newLabel = stateLabels[currentIndex + 1]
      await updateItemState(item.product_id, newState, item.displayed_name || item.product_name, 'decreased', newLabel)
    }
  }

  const handleIncrease = async (item: InventoryItem) => {
    const states = ['FULL', 'MEDIUM', 'LOW', 'EMPTY']
    const stateLabels = ['HIGH', 'MEDIUM', 'LOW', 'EMPTY']
    const currentIndex = states.indexOf(item.state)
    if (currentIndex > 0) {
      const newState = states[currentIndex - 1]
      const newLabel = stateLabels[currentIndex - 1]
      await updateItemState(item.product_id, newState, item.displayed_name || item.product_name, 'increased', newLabel)
    }
  }

  const updateItemState = async (productId: string, newState: string, productName: string, action: string, newLabel: string) => {
    try {
      await api.put(`/inventory/${productId}?user_id=${user?.id}`, {
        state: newState,
      })
      
      // Show notification
      setNotification(`✓ ${productName} ${action} to ${newLabel}. Inventory log updated & AI learning...`)
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null)
      }, 3000)
      
      await loadInventory()
    } catch (error) {
      console.error('Error updating item state:', error)
      setNotification(`❌ Failed to update ${productName}`)
      setTimeout(() => {
        setNotification(null)
      }, 3000)
    }
  }

  const deleteItem = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this item from your pantry?')) {
      return
    }

    try {
      await api.delete(`/inventory/${productId}?user_id=${user?.id}`)
      await loadInventory()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const sortedInventory = [...inventory].sort((a, b) => {
    // Sort by stock level: EMPTY -> LOW -> MEDIUM -> FULL
    const aPercentage = a.prediction?.stock_percentage || 0
    const bPercentage = b.prediction?.stock_percentage || 0
    
    // Items running out (< 3 days) should be first
    const aDaysLeft = a.prediction?.expected_days_left || 999
    const bDaysLeft = b.prediction?.expected_days_left || 999
    
    if (aDaysLeft < 3 && bDaysLeft >= 3) return -1
    if (aDaysLeft >= 3 && bDaysLeft < 3) return 1
    
    return aPercentage - bPercentage // Sort by lowest stock first
  })

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0 max-w-7xl mx-auto">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className={`${
              notification.startsWith('✓') ? 'bg-green-500' : 'bg-red-500'
            } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md`}>
              <span className="text-lg font-semibold">{notification}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Pantry</h1>
            <p className="text-gray-600">AI-powered predictions for your inventory</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadInventory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => router.push('/dashboard/pantry/add')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {loadingInventory ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedInventory.length === 0 ? (
          <div className="bg-white shadow rounded-xl p-12 text-center border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your pantry is empty</h2>
            <p className="text-gray-500 text-sm mb-6">
              Start by adding products manually or from shopping
            </p>
            <button
              onClick={() => router.push('/dashboard/pantry/add')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedInventory.map((item) => {
              const predictedState = item.prediction?.predicted_state || item.state
              const percentage = item.prediction?.stock_percentage || 0
              const daysLeft = item.prediction?.expected_days_left || 0
              const stockLabel = getStockLabel(predictedState)
              
              return (
                <div
                  key={item.product_id}
                  className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {item.displayed_name || item.product_name}
                      </h3>
                      
                      {/* AI Prediction Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-semibold">
                          <TrendingUp className="h-3 w-3" />
                          AI Prediction
                        </div>
                        {item.estimated_qty && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            📦 {item.estimated_qty}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteItem(item.product_id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Stock Level Display - LOW/MEDIUM/HIGH */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600">Stock Level</span>
                      <span className={`text-2xl font-bold px-4 py-1 rounded-xl ${getBgColorFromState(predictedState)} ${getTextColorFromState(predictedState)}`}>
                        {stockLabel}
                      </span>
                    </div>
                    
                    {/* Gradient Progress Bar */}
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getColorFromState(predictedState)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Days Left Prediction */}
                  {daysLeft > 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-900">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          {daysLeft < 3 ? (
                            <span className="text-red-600">⚠️ Running out in {daysLeft} days</span>
                          ) : (
                            <span>Will last ~{daysLeft} days</span>
                          )}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-blue-700">
                        AI Confidence: {Math.round((item.prediction?.confidence || 0) * 100)}%
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Adjust Stock</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={percentage === 0}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Less
                      </button>
                      <button
                        onClick={() => handleIncrease(item)}
                        disabled={percentage === 100}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        More
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
