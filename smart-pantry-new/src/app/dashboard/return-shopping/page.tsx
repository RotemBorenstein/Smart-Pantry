'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { api } from '@/lib/api'
import { useDropzone } from 'react-dropzone'
import { Upload, Receipt, Check, X, Plus, Minus } from 'lucide-react'

interface ReceiptItem {
  receipt_item_id?: string
  raw_label: string
  normalized_label?: string
  product_id?: string
  quantity?: number
  unit?: string
  unit_price?: number
  total_price?: number
  match_confidence?: number
}

interface Receipt {
  receipt_id?: string
  store_name?: string
  purchased_at?: string
  total_amount?: number
  items: ReceiptItem[]
}

export default function ReturnShoppingPage() {
  const router = useRouter()
  const { user, loading } = useAuthStore()
  const [mode, setMode] = useState<'select' | 'scan' | 'edit'>('select')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [lastShoppingList, setLastShoppingList] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadLastShoppingList()
    }
  }, [user])

  const loadLastShoppingList = async () => {
    try {
      const response = await api.get(`/shopping-lists?user_id=${user?.id}&status=COMPLETED`)
      if (response.data.length > 0) {
        setLastShoppingList(response.data[0])
      }
    } catch (error) {
      console.error('Error loading last shopping list:', error)
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    try {
      // Simulate OCR processing - in real app, this would call OCR API
      const formData = new FormData()
      formData.append('file', file)

      // Mock receipt data for demo
      const mockReceipt: Receipt = {
        store_name: 'סופר פארם',
        purchased_at: new Date().toISOString(),
        total_amount: 245.50,
        items: [
          { raw_label: 'חלב 3% 1 ליטר', quantity: 2, unit_price: 8.50, total_price: 17.00 },
          { raw_label: 'לחם אחיד', quantity: 1, unit_price: 6.90, total_price: 6.90 },
          { raw_label: 'ביצים גדולות', quantity: 1, unit_price: 12.50, total_price: 12.50 },
        ],
      }

      setReceipt(mockReceipt)
      setMode('edit')
    } catch (error) {
      console.error('Error processing receipt:', error)
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
  })

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    if (!receipt) return
    const newItems = [...receipt.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setReceipt({ ...receipt, items: newItems })
  }

  const addItem = () => {
    if (!receipt) return
    setReceipt({
      ...receipt,
      items: [...receipt.items, { raw_label: '' }],
    })
  }

  const removeItem = (index: number) => {
    if (!receipt) return
    const newItems = receipt.items.filter((_, i) => i !== index)
    setReceipt({ ...receipt, items: newItems })
  }

  const handleConfirm = async () => {
    if (!receipt || !user) return

    try {
      // Create receipt
      await api.post(`/receipts?user_id=${user.id}`, {
        store_name: receipt.store_name,
        purchased_at: receipt.purchased_at,
        total_amount: receipt.total_amount,
        items: receipt.items,
      })

      // Update inventory for each item
      for (const item of receipt.items) {
        if (item.product_id) {
          await api.post(`/inventory?user_id=${user.id}`, {
            product_id: item.product_id,
            state: 'FULL',
            estimated_qty: item.quantity,
            qty_unit: item.unit,
            last_source: 'RECEIPT',
          })
        }
      }

      router.push('/dashboard/pantry')
    } catch (error) {
      console.error('Error confirming receipt:', error)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">חזרה מקניות</h1>

        {mode === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setMode('scan')}
              className="bg-white shadow rounded-lg p-8 hover:shadow-lg transition-shadow text-center"
            >
              <Upload className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">סריקת קבלה</h2>
              <p className="text-gray-600">העלה תמונה של הקבלה לסריקה אוטומטית</p>
            </button>

            {lastShoppingList && (
              <button
                onClick={() => {
                  // Convert shopping list to receipt format
                  const receipt: Receipt = {
                    items: lastShoppingList.items.map((item: any) => ({
                      raw_label: item.free_text_name || 'מוצר',
                      quantity: item.recommended_qty || 1,
                      unit: item.unit || 'יח',
                    })),
                  }
                  setReceipt(receipt)
                  setMode('edit')
                }}
                className="bg-white shadow rounded-lg p-8 hover:shadow-lg transition-shadow text-center"
              >
                <Receipt className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  השתמש ברשימת הקניות האחרונה
                </h2>
                <p className="text-gray-600">
                  {lastShoppingList.items?.length || 0} מוצרים
                </p>
              </button>
            )}
          </div>
        )}

        {mode === 'scan' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">העלאת קבלה</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {uploading ? (
                <p className="text-gray-600">מעבד קבלה...</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">
                    גרור קובץ לכאן או לחץ לבחירה
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, PDF עד 10MB
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setMode('select')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              חזרה
            </button>
          </div>
        )}

        {mode === 'edit' && receipt && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">עריכת קבלה</h2>
              <button
                onClick={() => setMode('select')}
                className="text-gray-600 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם חנות
              </label>
              <input
                type="text"
                value={receipt.store_name || ''}
                onChange={(e) =>
                  setReceipt({ ...receipt, store_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">מוצרים</h3>
                <button
                  onClick={addItem}
                  className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 ml-1" />
                  הוסף מוצר
                </button>
              </div>

              <div className="space-y-3">
                {receipt.items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          שם מוצר
                        </label>
                        <input
                          type="text"
                          value={item.raw_label}
                          onChange={(e) =>
                            updateItem(index, 'raw_label', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          כמות
                        </label>
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) =>
                            updateItem(index, 'quantity', parseFloat(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          יחידה
                        </label>
                        <input
                          type="text"
                          value={item.unit || ''}
                          onChange={(e) =>
                            updateItem(index, 'unit', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400"
                          placeholder="יח/ק״ג/ליטר"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleConfirm}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 flex items-center"
              >
                <Check className="h-4 w-4 ml-2" />
                אישור והוספה למזווה
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
