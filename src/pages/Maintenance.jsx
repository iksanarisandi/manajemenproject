import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'

export default function Maintenance() {
  const [maintenances, setMaintenances] = useState([])
  const [completedProjects, setCompletedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMaintenance, setEditingMaintenance] = useState(null)
  const [formData, setFormData] = useState({
    projectId: '',
    initialCost: '',
    monthlyCost: '',
    paymentDate: '',
    active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const [maintenancesRes, projectsRes] = await Promise.all([
        axios.get('/.netlify/functions/maintenance', { headers }),
        axios.get('/.netlify/functions/projects', { headers }),
      ])
      setMaintenances(maintenancesRes.data)
      const completed = projectsRes.data.filter(p => p.projectStatus === 'completed')
      setCompletedProjects(completed)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (editingMaintenance) {
        await axios.put('/.netlify/functions/maintenance', 
          { id: editingMaintenance.id, ...formData },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await axios.post('/.netlify/functions/maintenance', 
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      fetchData()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save maintenance')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete('/.netlify/functions/maintenance', {
        headers: { Authorization: `Bearer ${token}` },
        data: { id }
      })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete maintenance')
    }
  }

  const toggleActive = async (maintenance) => {
    const token = localStorage.getItem('token')
    try {
      await axios.put('/.netlify/functions/maintenance', 
        { id: maintenance.id, active: !maintenance.active },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update maintenance')
    }
  }

  const sendWhatsAppReminder = (maintenance) => {
    const message = encodeURIComponent(
      `Halo kak ${maintenance.clientName}, pembayaran maintenance web ${maintenance.projectName} senilai ${parseFloat(maintenance.monthlyCost).toLocaleString('id-ID')}. Mohon diselesaikan. Pembayaran bisa lewat e-wallet atau rekening. Terima kasih.`
    )
    window.open(`https://wa.me/${maintenance.clientWa}?text=${message}`, '_blank')
  }

  const openModal = (maintenance = null) => {
    if (maintenance) {
      setEditingMaintenance(maintenance)
      setFormData({
        projectId: maintenance.projectId,
        initialCost: maintenance.initialCost,
        monthlyCost: maintenance.monthlyCost,
        paymentDate: maintenance.paymentDate,
        active: maintenance.active,
      })
    } else {
      setEditingMaintenance(null)
      setFormData({
        projectId: '',
        initialCost: '',
        monthlyCost: '',
        paymentDate: '1',
        active: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingMaintenance(null)
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
          <h2 className="text-2xl font-bold text-gray-900">Maintenance</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Maintenance
          </button>
        </div>

        <div className="space-y-4">
          {maintenances.map((maintenance) => (
            <div key={maintenance.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{maintenance.projectName}</h3>
                  <p className="text-gray-600 text-sm">Client: {maintenance.clientName}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      Initial Cost: <span className="font-semibold">Rp {parseFloat(maintenance.initialCost).toLocaleString('id-ID')}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Monthly Cost: <span className="font-semibold">Rp {parseFloat(maintenance.monthlyCost).toLocaleString('id-ID')}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Payment Date: <span className="font-semibold">{maintenance.paymentDate} of each month</span>
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  maintenance.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {maintenance.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => sendWhatsAppReminder(maintenance)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                  disabled={!maintenance.active}
                >
                  Send Reminder
                </button>
                <button
                  onClick={() => toggleActive(maintenance)}
                  className={`flex-1 px-3 py-2 rounded transition-colors text-sm ${
                    maintenance.active
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {maintenance.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openModal(maintenance)}
                  className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(maintenance.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {maintenances.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No maintenance records yet. Add maintenance for completed projects!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full my-8 animate-fade-in">
            <h3 className="text-xl font-bold mb-4">
              {editingMaintenance ? 'Edit Maintenance' : 'Add Maintenance'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingMaintenance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completed Project</label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select a project</option>
                    {completedProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.clientName}
                      </option>
                    ))}
                  </select>
                  {completedProjects.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      No completed projects available
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Cost</label>
                <input
                  type="number"
                  required
                  value={formData.initialCost}
                  onChange={(e) => setFormData({ ...formData, initialCost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Cost</label>
                <input
                  type="number"
                  required
                  value={formData.monthlyCost}
                  onChange={(e) => setFormData({ ...formData, monthlyCost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date (day of month)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="31"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
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
                  {editingMaintenance ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
