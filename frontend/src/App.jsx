import React, { useState, useEffect } from 'react';
import API from './api';
import { Search, Plus, Filter, AlertCircle, CheckCircle, Clock, ArrowLeft, RefreshCw } from 'lucide-react';

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'create' | 'detail'
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium'
  });

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      
      const response = await API.get('/tickets', { params });
      setTickets(response.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, search]);

  // Handle Create Ticket
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tickets', formData);
      setFormData({ customer_name: '', customer_email: '', subject: '', description: '', priority: 'Medium' });
      setCurrentView('list');
      fetchTickets();
    } catch (err) {
      alert('Error creating ticket');
    }
  };

  // Handle Status Update
  const updateTicketStatus = async (ticket_id, newStatus) => {
    try {
      await API.put(`/tickets/${ticket_id}`, { status: newStatus });
      fetchTickets();
      if (selectedTicket) {
        // Refresh selected ticket details
        const res = await API.get(`/tickets/${ticket_id}`);
        setSelectedTicket(res.data);
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  // View Ticket Details
  const viewDetails = async (ticket_id) => {
    try {
      const res = await API.get(`/tickets/${ticket_id}`);
      setSelectedTicket(res.data);
      setCurrentView('detail');
    } catch (err) {
      alert('Error loading ticket details');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wide">Datastraw Support CRM</h1>
          <button 
            onClick={() => setCurrentView('list')}
            className="text-sm bg-indigo-700 px-3 py-1.5 rounded hover:bg-indigo-800 transition"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* VIEW 1: TICKET LIST */}
        {currentView === 'list' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search by name, email, ID, or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <button 
                onClick={() => setCurrentView('create')}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
              >
                <Plus size={18} /> New Ticket
              </button>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
              {loading ? (
                <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2">
                  <RefreshCw className="animate-spin" size={20} /> Loading tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No tickets found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                        <th className="p-4">Ticket ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Priority</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tickets.map((t) => (
                        <tr 
                          key={t.ticket_id} 
                          onClick={() => viewDetails(t.ticket_id)}
                          className="hover:bg-gray-50 cursor-pointer transition"
                        >
                          <td className="p-4 font-semibold text-indigo-600">{t.ticket_id}</td>
                          <td className="p-4 font-medium">{t.customer_name}</td>
                          <td className="p-4 text-gray-600 truncate max-w-xs">{t.subject}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                              t.priority === 'High' ? 'bg-red-100 text-red-700' :
                              t.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium ${
                              t.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                              t.status === 'In Progress' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: CREATE TICKET */}
        {currentView === 'create' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Create Support Ticket</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input 
                  type="text" 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  rows="4" 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Submit Ticket
                </button>
                <button 
                  type="button"
                  onClick={() => setCurrentView('list')}
                  className="px-4 py-2.5 border rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: TICKET DETAIL */}
        {currentView === 'detail' && selectedTicket && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow border border-gray-100">
            <button 
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-1 text-sm text-indigo-600 font-medium mb-6 hover:underline"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600">{selectedTicket.ticket_id}</span>
                <h2 className="text-2xl font-bold mt-1">{selectedTicket.subject}</h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(selectedTicket.ticket_id, e.target.value)}
                  className="p-2 border rounded-lg text-sm font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg text-sm">
              <div>
                <span className="text-gray-500 block">Customer Name</span>
                <span className="font-semibold">{selectedTicket.customer_name}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Email Address</span>
                <span className="font-semibold">{selectedTicket.customer_email}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Priority Level</span>
                <span className="font-semibold">{selectedTicket.priority}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Created At</span>
                <span className="font-semibold">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Issue Description</h3>
              <p className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed border">
                {selectedTicket.description}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;