import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { format } from 'date-fns'
import { formatRupiah } from '../utils/format'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    value: '',
    projectStatus: 'draft',
    paymentStatus: 'unpaid',
    acceptanceStatus: 'accepted',
    date: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const [projectsRes, clientsRes] = await Promise.all([
        axios.get('/.netlify/functions/projects', { headers }),
        axios.get('/.netlify/functions/clients', { headers }),
      ])
      setProjects(projectsRes.data)
      setClients(clientsRes.data)
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
      if (editingProject) {
        await axios.put('/.netlify/functions/projects', 
          { id: editingProject.id, ...formData },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await axios.post('/.netlify/functions/projects', 
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      fetchData()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save project')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    const token = localStorage.getItem('token')
    try {
      await axios.delete('/.netlify/functions/projects', {
        headers: { Authorization: `Bearer ${token}` },
        data: { id }
      })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete project')
    }
  }

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name,
        clientId: project.clientId,
        value: project.value,
        projectStatus: project.projectStatus,
        paymentStatus: project.paymentStatus,
        acceptanceStatus: project.acceptanceStatus,
        date: format(new Date(project.date), 'yyyy-MM-dd'),
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: '',
        clientId: '',
        value: '',
        projectStatus: 'draft',
        paymentStatus: 'unpaid',
        acceptanceStatus: 'accepted',
        date: format(new Date(), 'yyyy-MM-dd'),
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProject(null)
  }

  const getStatusColor = (status, type) => {
    const colors = {
      projectStatus: {
        draft: 'bg-gray-100 text-gray-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        revision: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
      },
      paymentStatus: {
        unpaid: 'bg-red-100 text-red-800',
        'down-payment': 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
      },
      acceptanceStatus: {
        accepted: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
      },
    }
    return colors[type]?.[status] || 'bg-gray-100 text-gray-800'
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
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Project
          </button>
        </div>

        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                  <p className="text-gray-600 text-sm">Client: {project.clientName}</p>
                  <p className="text-gray-900 font-semibold mt-2">
                    Rp {formatRupiah(parseFloat(project.value))}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {format(new Date(project.date), 'MMM dd, yyyy')}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectStatus, 'projectStatus')}`}>
                  {project.projectStatus}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.paymentStatus, 'paymentStatus')}`}>
                  {project.paymentStatus}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.acceptanceStatus, 'acceptanceStatus')}`}>
                  {project.acceptanceStatus}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openModal(project)}
                  className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No projects yet. Add your first project!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full my-8 animate-fade-in">
            <h3 className="text-xl font-bold mb-4">
              {editingProject ? 'Edit Project' : 'Add Project'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Value</label>
                <input
                  type="number"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Status</label>
                <select
                  value={formData.projectStatus}
                  onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="in-progress">In Progress</option>
                  <option value="revision">Revision</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="down-payment">Down Payment</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Acceptance Status</label>
                <select
                  value={formData.acceptanceStatus}
                  onChange={(e) => setFormData({ ...formData, acceptanceStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="accepted">Accepted</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
