'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { api } from '@/lib/api'
import Link from 'next/link'
import { ShoppingCart, Plus, ArrowRight } from 'lucide-react'

interface ShoppingListItem {
  shopping_list_item_id: string
  product_id: string | null
  free_text_name: string | null
  recommended_qty: number | null
  unit: string | null
  status: string
  priority: number | null
}

interface ShoppingList {
  shopping_list_id: string
  title: string | null
  status: string
  items: ShoppingListItem[]
}

export default function ShoppingPage() {
  const router = useRouter()
  const { user, loading } = useAuthStore()
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([])
  const [activeList, setActiveList] = useState<ShoppingList | null>(null)
  const [showFrequentItems, setShowFrequentItems] = useState(false)
  const [loadingLists, setLoadingLists] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadShoppingLists()
    }
  }, [user])

  const loadShoppingLists = async () => {
    try {
      setLoadingLists(true)
      const response = await api.get(`/shopping-lists?user_id=${user?.id}&status=ACTIVE`)
      setShoppingLists(response.data)
      if (response.data.length > 0) {
        setActiveList(response.data[0])
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error)
    } finally {
      setLoadingLists(false)
    }
  }

  const createNewList = async () => {
    try {
      const response = await api.post(`/shopping-lists?user_id=${user?.id}`, {
        title: `רשימת קניות - ${new Date().toLocaleDateString('he-IL')}`,
        status: 'ACTIVE',
      })
      const newList = response.data
      setShoppingLists([newList, ...shoppingLists])
      setActiveList(newList)
      setShowFrequentItems(true)
    } catch (error) {
      console.error('Error creating shopping list:', error)
    }
  }

  const addItem = async (productName: string) => {
    if (!activeList) return

    try {
      await api.post(`/shopping-lists/${activeList.shopping_list_id}/items`, {
        free_text_name: productName,
        status: 'PLANNED',
      })
      loadShoppingLists()
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleGoShopping = () => {
    if (activeList) {
      router.push(`/dashboard/shopping-active?list_id=${activeList.shopping_list_id}`)
    }
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">יציאה לקניות</h1>
          <button
            onClick={createNewList}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
          >
            <Plus className="h-4 w-4 ml-2" />
            צור רשימה חדשה
          </button>
        </div>

        {showFrequentItems && activeList && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">מוצרים תכופים</h3>
            <p className="text-sm text-blue-700 mb-4">
              האם תרצה להוסיף מוצרים תכופים לרשימה?
            </p>
            <button
              onClick={() => {
                // Add frequent items logic here
                setShowFrequentItems(false)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              הוסף מוצרים תכופים
            </button>
          </div>
        )}

        {activeList && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{activeList.title || 'רשימת קניות'}</h2>
              <button
                onClick={handleGoShopping}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                צא לקניות
                <ArrowRight className="h-4 w-4 mr-2" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="הוסף מוצר לרשימה..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addItem(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              {activeList.items?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">הרשימה ריקה</p>
              ) : (
                activeList.items?.map((item) => (
                  <div
                    key={item.shopping_list_item_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <span>{item.free_text_name || 'מוצר'}</span>
                    {item.recommended_qty && (
                      <span className="text-sm text-gray-500">
                        {item.recommended_qty} {item.unit || ''}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">רשימות קודמות</h2>
          {shoppingLists.length === 0 ? (
            <p className="text-gray-500 text-center py-4">אין רשימות קודמות</p>
          ) : (
            <div className="space-y-2">
              {shoppingLists.map((list) => (
                <div
                  key={list.shopping_list_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => setActiveList(list)}
                >
                  <span>{list.title || 'רשימה ללא שם'}</span>
                  <span className="text-sm text-gray-500">
                    {list.items?.length || 0} מוצרים
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

