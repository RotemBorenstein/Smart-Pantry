'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { api } from '@/lib/api'
import { Check, X, Plus, ShoppingBag } from 'lucide-react'

interface ShoppingItem {
  shopping_list_item_id: string
  product_id: string | null
  free_text_name: string | null
  recommended_qty: number | null
  unit: string | null
  status: string
  quantity?: number
}

export default function ShoppingActivePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuthStore()
  const listId = searchParams.get('list_id')
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [unboughtItems, setUnboughtItems] = useState<ShoppingItem[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && listId) {
      loadItems()
    }
  }, [user, listId])

  const loadItems = async () => {
    try {
      setLoadingItems(true)
      const response = await api.get(`/shopping-lists/${listId}/items`)
      setItems(response.data)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const toggleItem = async (item: ShoppingItem) => {
    const newStatus = item.status === 'BOUGHT' ? 'PLANNED' : 'BOUGHT'
    try {
      await api.put(`/shopping-lists/items/${item.shopping_list_item_id}`, {
        status: newStatus,
      })
      loadItems()
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await api.put(`/shopping-lists/items/${itemId}`, {
        user_qty_override: quantity,
      })
      loadItems()
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleFinishShopping = () => {
    const unbought = items.filter((item) => item.status !== 'BOUGHT')
    setUnboughtItems(unbought)
    setShowFinishDialog(true)
  }

  const handleAddToNextList = async (itemIds: string[]) => {
    // Add selected items to next shopping list
    // This would create a new list or add to existing
    setShowFinishDialog(false)
    router.push('/dashboard/shopping')
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">אני בקניות</h1>

        {loadingItems ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.shopping_list_item_id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      item.status === 'BOUGHT'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <button
                        onClick={() => toggleItem(item)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                          item.status === 'BOUGHT'
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {item.status === 'BOUGHT' && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </button>
                      <div className="flex-1">
                        <span
                          className={
                            item.status === 'BOUGHT' ? 'line-through text-gray-500' : ''
                          }
                        >
                          {item.free_text_name || 'מוצר'}
                        </span>
                        {item.recommended_qty && (
                          <span className="text-sm text-gray-500 mr-2">
                            ({item.recommended_qty} {item.unit || ''})
                          </span>
                        )}
                      </div>
                    </div>

                    {item.status === 'BOUGHT' && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="number"
                          min="1"
                          placeholder="כמות"
                          defaultValue={item.quantity || item.recommended_qty || 1}
                          onChange={(e) =>
                            updateQuantity(
                              item.shopping_list_item_id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 placeholder:text-gray-400"
                        />
                        <span className="text-sm text-gray-500">
                          {item.unit || 'יח'}
                        </span>
                      </div>
                    )}

                    <div className="mr-4 text-sm text-gray-500">
                      {/* Duration indicator - would be calculated based on shopping frequency */}
                      <span>יספיק ל-7 ימים</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleFinishShopping}
                className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 flex items-center text-lg"
              >
                <ShoppingBag className="h-5 w-5 ml-2" />
                סיימתי קניות
              </button>
            </div>
          </>
        )}

        {showFinishDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">
                הוסף מוצרים שלא קנית לרשימה הבאה?
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {unboughtItems.map((item) => (
                  <label
                    key={item.shopping_list_item_id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="ml-2 h-4 w-4 text-primary-600"
                    />
                    <span>{item.free_text_name || 'מוצר'}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  onClick={() => setShowFinishDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  ביטול
                </button>
                <button
                  onClick={() => {
                    const selected = unboughtItems.map((i) => i.shopping_list_item_id)
                    handleAddToNextList(selected)
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  הוסף לרשימה הבאה
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

