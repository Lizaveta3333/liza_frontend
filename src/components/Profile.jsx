import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { productsAPI, ordersAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [myProducts, setMyProducts] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [salesOrders, setSalesOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }
    if (user) {
      loadProfileData()
    }
  }, [user, authLoading])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      const [productsRes, ordersRes, salesRes] = await Promise.all([
        productsAPI.getMy(),
        ordersAPI.getMy(),
        ordersAPI.getMySales().catch(() => ({ data: [] })),
      ])
      setMyProducts(productsRes.data)
      setMyOrders(ordersRes.data)
      setSalesOrders(salesRes.data || [])
    } catch (err) {
      console.error('Error loading profile data:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product.id)
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images?.join(', ') || '',
    })
  }

  const handleUpdateProduct = async (productId) => {
    try {
      const updateData = {
        ...editForm,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock),
        images: editForm.images ? editForm.images.split(',').map(url => url.trim()) : [],
      }
      await productsAPI.update(productId, updateData)
      setEditingProduct(null)
      setSuccess('Product updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
      loadProfileData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await productsAPI.delete(productId)
      setSuccess('Product deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
      loadProfileData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      setSuccess('Order status updated!')
      setTimeout(() => setSuccess(''), 3000)
      loadProfileData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Personal Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {user.full_name}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {user.phone}
                </p>
                {user.avatar && (
                  <div>
                    <span className="font-medium">Avatar:</span>
                    <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full mt-2" />
                  </div>
                )}
                {user.about && (
                  <p>
                    <span className="font-medium">About:</span> {user.about}
                  </p>
                )}
                {user.birth_date && (
                  <p>
                    <span className="font-medium">Birth Date:</span> {user.birth_date}
                  </p>
                )}
                <p>
                  <span className="font-medium">Rating:</span> {user.rating}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex gap-4 mb-4 border-b">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'products'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              My Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'orders'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              My Orders
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'sales'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              Sales Orders
            </button>
          </div>

          {activeTab === 'products' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Products</h2>
              {myProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  No products yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow p-6">
                      {editingProduct === product.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            rows="3"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                              className="px-3 py-2 border rounded"
                              placeholder="Price"
                            />
                            <input
                              type="number"
                              value={editForm.stock}
                              onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                              className="px-3 py-2 border rounded"
                              placeholder="Stock"
                            />
                          </div>
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Category"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateProduct(product.id)}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                          <p className="text-gray-600 mb-4">{product.description}</p>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-indigo-600">${product.price}</span>
                            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                product.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {product.status}
                            </span>
                            <span className="text-sm text-gray-500">{product.category}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h2>
              {myOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  No orders yet
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {myOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{order.product_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{order.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">${order.total_price}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(order.order_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'sales' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales Orders (Orders on My Products)</h2>
              {salesOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  No sales orders yet
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{order.product_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{order.buyer_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{order.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">${order.total_price}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {order.status === 'pending' && (
                              <select
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1"
                                defaultValue=""
                              >
                                <option value="">Change status</option>
                                <option value="confirmed">Confirm</option>
                                <option value="completed">Complete</option>
                                <option value="cancelled">Cancel</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}

