'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { api } from '@/lib/api'
import { ChefHat, Plus, ArrowLeft, Sparkles, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface Product {
  product_id: string
  product_name: string
  category_name?: string
}

interface SelectedItem {
  product_id: string
  product_name: string
  category_name?: string
  quantity: number
}

export default function SpecialMealPage() {
  const router = useRouter()
  const { user, loading } = useAuthStore()
  const [mealName, setMealName] = useState('')
  const [mealDescription, setMealDescription] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadProducts()
    }
  }, [user])

  const loadProducts = async () => {
    try {
      const response = await api.get('/products')
      setAllProducts(response.data)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const filteredProducts = allProducts.filter((product) =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addItem = (product: Product) => {
    const existing = selectedItems.find((item) => item.product_id === product.product_id)
    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          product_id: product.product_id,
          product_name: product.product_name,
          category_name: product.category_name,
          quantity: 1,
        },
      ])
    }
  }

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.product_id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      setSelectedItems(
        selectedItems.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  const handleAddToShoppingList = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item')
      return
    }

    setIsAdding(true)
    try {
      // Get or create active shopping list
      const listsResponse = await api.get(`/shopping-lists?user_id=${user?.id}&status=ACTIVE`)
      let listId

      if (listsResponse.data.length > 0) {
        listId = listsResponse.data[0].shopping_list_id
      } else {
        // Create new list
        const newListResponse = await api.post(`/shopping-lists?user_id=${user?.id}`, {
          title: `Shopping List - ${new Date().toLocaleDateString('en-US')}`,
          status: 'ACTIVE',
        })
        listId = newListResponse.data.shopping_list_id
      }

      // Add all selected items to the list
      for (const item of selectedItems) {
        await api.post(`/shopping-lists/${listId}/items`, {
          product_id: item.product_id,
          recommended_qty: item.quantity,
          status: 'PLANNED',
          added_by: 'USER',
        })
      }

      // Redirect to shopping page
      router.push('/dashboard/shopping')
    } catch (error) {
      console.error('Error adding items to shopping list:', error)
      alert('Failed to add items to shopping list')
    } finally {
      setIsAdding(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Shopping List
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <ChefHat className="h-10 w-10 text-purple-600" />
            Special Meal Planning
          </h1>
          <p className="text-gray-600">Plan a special meal and add ingredients to your shopping list</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Select Ingredients
              </h2>

              {/* Search */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder:text-gray-400 mb-4"
              />

              {/* Products Grid */}
              <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <motion.button
                    key={product.product_id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addItem(product)}
                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 text-left transition-all"
                  >
                    <p className="font-semibold text-gray-900">{product.product_name}</p>
                    <p className="text-sm text-gray-600">{product.category_name}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Selected Items */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 sticky top-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Selected Items</h3>

              <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items selected</p>
                ) : (
                  selectedItems.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">{item.category_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={handleAddToShoppingList}
                disabled={selectedItems.length === 0 || isAdding}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg transition-all"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Add to Shopping List
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

