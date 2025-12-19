'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { api } from '@/lib/api'
import { Package, Trash2, RefreshCw, Plus } from 'lucide-react'

interface InventoryItem {
  product_id: string
  product_name: string
  state: 'EMPTY' | 'LOW' | 'MEDIUM' | 'FULL' | 'UNKNOWN'
  estimated_qty: number | null
  qty_unit: string | null
  confidence: number
  displayed_name: string | null
}

const stateLabels = {
  EMPTY: 'Empty',
  LOW: 'Low (¼)',
  MEDIUM: 'Medium (½)',
  FULL: 'Full (¾)',
  UNKNOWN: 'Unknown',
}

const stateColors = {
  EMPTY: 'bg-red-100 text-red-800',
  LOW: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  FULL: 'bg-green-100 text-green-800',
  UNKNOWN: 'bg-gray-100 text-gray-800',
}

export default function PantryPage() {
  const router = useRouter()
  const { user, loading } = useAuthStore()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loadingInventory, setLoadingInventory] = useState(true)

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
      setInventory(response.data)
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoadingInventory(false)
    }
  }

  const updateState = async (productId: string, newState: string) => {
    try {
      await api.put(`/inventory/${productId}?user_id=${user?.id}`, {
        state: newState,
      })
      loadInventory()
    } catch (error) {
      console.error('Error updating state:', error)
    }
  }

  const handleDecrease = (item: InventoryItem) => {
    const states: Array<'EMPTY' | 'LOW' | 'MEDIUM' | 'FULL'> = ['EMPTY', 'LOW', 'MEDIUM', 'FULL']
    const currentIndex = states.indexOf(item.state as any)
    if (currentIndex > 0) {
      updateState(item.product_id, states[currentIndex - 1])
    }
  }

  const handleIncrease = (item: InventoryItem) => {
    const states: Array<'EMPTY' | 'LOW' | 'MEDIUM' | 'FULL'> = ['EMPTY', 'LOW', 'MEDIUM', 'FULL']
    const currentIndex = states.indexOf(item.state as any)
    if (currentIndex < states.length - 1 && currentIndex !== -1) {
      updateState(item.product_id, states[currentIndex + 1])
    }
  }

  const handleEmpty = async (item: InventoryItem) => {
    const reason = prompt('Why did it run out? (Not tasty / Expired / Other)')
    if (reason) {
      // Log to inventory_log
      await api.post(`/inventory/log?user_id=${user?.id}`, {
        product_id: item.product_id,
        action: 'EMPTY',
        delta_state: 'EMPTY',
        note: `Ran out: ${reason}`,
      })
      updateState(item.product_id, 'EMPTY')
    }
  }

  const handleTrash = async (item: InventoryItem) => {
    const reason = prompt('Why was it thrown away? (Not tasty / Expired / Other)')
    if (reason) {
      await api.post(`/inventory/log?user_id=${user?.id}`, {
        product_id: item.product_id,
        action: 'TRASH',
        delta_state: 'EMPTY',
        note: `Thrown away: ${reason}`,
      })
      updateState(item.product_id, 'EMPTY')
    }
  }

  const handleRepurchase = async (item: InventoryItem) => {
    const reason = prompt('Why repurchase? (Ran out / Defective / Other)')
    if (reason) {
      await api.post(`/inventory/log?user_id=${user?.id}`, {
        product_id: item.product_id,
        action: 'PURCHASE',
        delta_state: 'FULL',
        note: `Repurchased: ${reason}`,
      })
      updateState(item.product_id, 'FULL')
    }
  }

  // Sort by state priority (EMPTY first, then LOW, etc.)
  const sortedInventory = [...inventory].sort((a, b) => {
    const order = { EMPTY: 0, LOW: 1, MEDIUM: 2, FULL: 3, UNKNOWN: 4 }
    return order[a.state] - order[b.state]
  })

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pantry</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/dashboard/pantry/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </button>
            <button
              onClick={loadInventory}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center text-sm transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loadingInventory ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 inline-flex items-center font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedInventory.map((item) => (
              <div
                key={item.product_id}
                className="bg-white shadow rounded-xl p-5 hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {item.displayed_name || item.product_name}
                    </h3>
                    {item.estimated_qty && (
                      <p className="text-xs text-gray-500">
                        Qty: {item.estimated_qty} {item.qty_unit || 'units'}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${stateColors[item.state]}`}
                  >
                    {stateLabels[item.state]}
                  </span>
                </div>

                {/* Stock Level Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Remaining in stock</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={item.state === 'EMPTY'}
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Decrease"
                      >
                        Less
                      </button>
                      <button
                        onClick={() => handleIncrease(item)}
                        disabled={item.state === 'FULL'}
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Increase"
                      >
                        More
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.state === 'FULL' ? 'bg-green-500 w-full' :
                        item.state === 'MEDIUM' ? 'bg-yellow-500 w-2/3' :
                        item.state === 'LOW' ? 'bg-orange-500 w-1/3' :
                        'bg-red-500 w-[5%]'
                      }`}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEmpty(item)}
                      className="text-xs bg-red-50 text-red-700 px-2 py-1.5 rounded hover:bg-red-100 transition-colors"
                    >
                      Ran Out
                    </button>
                    <button
                      onClick={() => handleTrash(item)}
                      className="text-xs bg-orange-50 text-orange-700 px-2 py-1.5 rounded hover:bg-orange-100 transition-colors"
                    >
                      Trash
                    </button>
                    <button
                      onClick={() => handleRepurchase(item)}
                      className="text-xs bg-green-50 text-green-700 px-2 py-1.5 rounded hover:bg-green-100 transition-colors"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
