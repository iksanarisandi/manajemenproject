import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({ name: '', wa: '' })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/.netlify/functions/clients', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClients(res.data)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (editingClient) {
        await axios.put('/.netlify/functions/clients', 
          { id: editingClient.id, ...formData },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await axios.post('/.netlify/functions/clients', 
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      fetchClients()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save client')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete('/.netlify/functions/clients', {
        headers: { Authorization: `Bearer ${token}` },
        data: { id }
      })
      fetchClients()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete client')
    }
  }

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({ name: client.name, wa: client.wa })
    } else {
      setEditingClient(null)
      setFormData({ name: '', wa: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingClient(null)
    setFormData({ name: '', wa: '' })
  }

  const openWhatsApp = (wa, name) => {
    const message = encodeURIComponent(`Hello ${name}, `)
    window.open(`https://wa.me/${wa}?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Client
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{client.name}</h3>
              <p className="text-gray-600 mb-4">{client.wa}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openWhatsApp(client.wa, client.name)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => openModal(client)}
                  className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No clients yet. Add your first client!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-xl font-bold mb-4">
              {editingClient ? 'Edit Client' : 'Add Client'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="628123456789"
                  value={formData.wa}
                  onChange={(e) => setFormData({ ...formData, wa: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingClient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
