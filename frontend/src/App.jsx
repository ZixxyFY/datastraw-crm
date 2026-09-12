import React, { useState, useEffect } from 'react';
import API from './api';
import { Search, Plus, ArrowLeft, RefreshCw, Inbox, Mail } from 'lucide-react';

const STAGES = ['Open', 'In Progress', 'Closed'];

const STAGE_COLOR = {
  Open: 'var(--navy)',
  'In Progress': 'var(--amber)',
  Closed: 'var(--green)',
};

const PRIORITY_TOKEN = {
  Low: { label: 'L', bg: 'var(--green-soft)', fg: 'var(--green)' },
  Medium: { label: 'M', bg: 'var(--amber-soft)', fg: 'var(--amber)' },
  High: { label: 'H', bg: 'var(--red-soft)', fg: 'var(--red)' },
};

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
}

function Stepper({ status, size = 'sm', onSelect }) {
  const activeIndex = STAGES.indexOf(status);
  const interactive = typeof onSelect === 'function';
  const dot = size === 'lg' ? 12 : 7;
  const gap = size === 'lg' ? 'gap-2' : 'gap-1.5';

  return (
    <div className={`flex items-center ${gap}`}>
      {STAGES.map((stage, i) => {
        const filled = i <= activeIndex;
        const isCurrent = i === activeIndex;
        const dotEl = (
          <span
            style={{
              width: dot,
              height: dot,
              borderRadius: 999,
              background: filled ? STAGE_COLOR[stage] : 'var(--line)',
              boxShadow: isCurrent ? `0 0 0 3px ${STAGE_COLOR[stage]}22` : 'none',
              display: 'inline-block',
              transition: 'background 150ms ease',
            }}
          />
        );
        return (
          <React.Fragment key={stage}>
            {interactive ? (
              <button
                type="button"
                onClick={() => onSelect(stage)}
                title={stage}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
              >
                {dotEl}
                {size === 'lg' && (
                  <span
                    className="text-xs font-medium"
                    style={{ color: isCurrent ? 'var(--ink)' : 'var(--ink-soft)' }}
                  >
                    {stage}
                  </span>
                )}
              </button>
            ) : (
              dotEl
            )}
            {i < STAGES.length - 1 && (
              <span
                style={{
                  width: size === 'lg' ? 28 : 12,
                  height: 1,
                  background: i < activeIndex ? STAGE_COLOR[stage] : 'var(--line)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'create' | 'detail'
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium',
  });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tickets', formData);
      setFormData({ customer_name: '', customer_email: '', subject: '', description: '', priority: 'Medium' });
      setCurrentView('list');
      fetchTickets();
    } catch (err) {
      alert('Error creating ticket. Please check the backend connection.');
    }
  };

  const updateTicketStatus = async (ticket_id, newStatus) => {
    try {
      await API.put(`/tickets/${ticket_id}`, { status: newStatus });
      fetchTickets();
      if (selectedTicket) {
        const res = await API.get(`/tickets/${ticket_id}`);
        setSelectedTicket(res.data);
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const viewDetails = async (ticket_id) => {
    try {
      const res = await API.get(`/tickets/${ticket_id}`);
      setSelectedTicket(res.data);
      setCurrentView('detail');
    } catch (err) {
      alert('Error loading ticket details');
    }
  };

  const counts = STAGES.reduce((acc, s) => {
    acc[s] = tickets.filter((t) => t.status === s).length;
    return acc;
  }, {});

  const toggleStatusFilter = (stage) => {
    setStatusFilter((prev) => (prev === stage ? '' : stage));
  };

  return (
    <div className="app-root min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .app-root {
          --paper: #F5F4EF;
          --paper-raised: #FFFFFF;
          --ink: #221F1B;
          --ink-soft: #79735F;
          --line: #E4E0D3;
          --navy: #1D3557;
          --navy-soft: #E8ECF3;
          --amber: #A8792F;
          --amber-soft: #F4EAD6;
          --green: #3F6B4E;
          --green-soft: #E4EEE6;
          --red: #A6402F;
          --red-soft: #F5E3DF;
          background: var(--paper);
          color: var(--ink);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .font-display { font-family: 'Archivo', system-ui, sans-serif; letter-spacing: -0.01em; color: var(--ink); }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }

        .panel {
          background: var(--paper-raised);
          border: 1px solid var(--line);
          border-radius: 10px;
        }

        .chip {
          border: 1px solid var(--line);
          background: var(--paper-raised);
          border-radius: 8px;
          transition: border-color 150ms ease, background 150ms ease;
        }
        .chip:hover { border-color: var(--ink-soft); }

        .row-hover:hover { background: rgba(34, 31, 27, 0.025); }

        .stub-input {
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 8px;
        }
        .stub-input:focus {
          outline: none;
          border-color: var(--navy);
          background: var(--paper-raised);
        }

        .fade-in { animation: fadeIn 400ms ease both; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .seg-btn {
          border: 1px solid var(--line);
          background: var(--paper);
          transition: all 150ms ease;
        }
      `}</style>

      {/* Header */}
      <header className="border-b sticky top-0 z-10" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center font-mono text-xs font-semibold"
              style={{ background: 'var(--navy)', color: 'var(--paper-raised)' }}
            >
              DS
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-tight">Datastraw</h1>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Ticket desk</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => toggleStatusFilter(stage)}
                className="chip px-3 py-1.5 flex items-center gap-2"
                style={statusFilter === stage ? { borderColor: STAGE_COLOR[stage], background: `${STAGE_COLOR[stage]}12` } : {}}
              >
                <span style={{ width: 7, height: 7, borderRadius: 999, background: STAGE_COLOR[stage], display: 'inline-block' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{stage}</span>
                <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>{counts[stage]}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* VIEW 1: TICKET LIST */}
        {currentView === 'list' && (
          <div className="fade-in">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5" size={16} style={{ color: 'var(--ink-soft)' }} />
                <input
                  type="text"
                  placeholder="Search tickets"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="stub-input w-full pl-9 pr-3 py-2 text-sm"
                />
              </div>

              <button
                onClick={() => setCurrentView('create')}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium justify-center"
                style={{ background: 'var(--navy)', color: 'var(--paper-raised)' }}
              >
                <Plus size={16} /> New ticket
              </button>
            </div>

            <div className="panel overflow-hidden">
              {loading ? (
                <div className="p-16 text-center flex flex-col justify-center items-center gap-3" style={{ color: 'var(--ink-soft)' }}>
                  <RefreshCw className="animate-spin" size={22} style={{ color: 'var(--navy)' }} />
                  <span className="text-sm">Loading tickets…</span>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                  <Inbox size={28} style={{ color: 'var(--ink-soft)' }} className="mb-3" />
                  <h3 className="font-display text-base font-semibold mb-1">Nothing here</h3>
                  <p className="text-sm max-w-sm" style={{ color: 'var(--ink-soft)' }}>
                    No tickets match your filters. Clear the search or the status filter, or create a new ticket.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-medium" style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--line)' }}>
                        <th className="p-3 pl-5 font-mono font-medium">ID</th>
                        <th className="p-3 font-medium">Customer</th>
                        <th className="p-3 font-medium">Subject</th>
                        <th className="p-3 font-medium">Priority</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 pr-5 font-medium">Opened</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t) => {
                        const p = PRIORITY_TOKEN[t.priority] || PRIORITY_TOKEN.Medium;
                        return (
                          <tr
                            key={t.ticket_id}
                            onClick={() => viewDetails(t.ticket_id)}
                            className="row-hover cursor-pointer"
                            style={{ borderBottom: '1px solid var(--line)' }}
                          >
                            <td className="p-3 pl-5 font-mono text-sm" style={{ color: 'var(--navy)' }}>{t.ticket_id}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                                  style={{ background: 'var(--navy-soft)', color: 'var(--navy)' }}
                                >
                                  {getInitials(t.customer_name)}
                                </div>
                                <span className="text-sm font-medium">{t.customer_name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-sm truncate max-w-xs" style={{ color: 'var(--ink-soft)' }}>{t.subject}</td>
                            <td className="p-3">
                              <span
                                className="inline-flex items-center justify-center w-6 h-6 rounded font-mono text-xs font-semibold"
                                style={{ background: p.bg, color: p.fg }}
                                title={t.priority}
                              >
                                {p.label}
                              </span>
                            </td>
                            <td className="p-3">
                              <Stepper status={t.status} />
                            </td>
                            <td className="p-3 pr-5 font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
                              {new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: CREATE TICKET */}
        {currentView === 'create' && (
          <div className="max-w-xl mx-auto fade-in">
            <button
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2 text-sm font-medium mb-4"
              style={{ color: 'var(--ink-soft)' }}
            >
              <ArrowLeft size={15} /> Back
            </button>

            <div className="panel p-7">
              <h2 className="font-display text-xl font-semibold mb-1">New ticket</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>Log a new customer issue for the desk.</p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Customer name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="stub-input w-full p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="stub-input w-full p-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of the issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="stub-input w-full p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Priority</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map((level) => {
                      const active = formData.priority === level;
                      const token = PRIORITY_TOKEN[level];
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: level })}
                          className="seg-btn flex-1 py-2 rounded-md text-sm font-medium"
                          style={active ? { background: token.bg, color: token.fg, borderColor: token.fg } : { color: 'var(--ink-soft)' }}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea
                    rows="5"
                    required
                    placeholder="Provide as much context as possible"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="stub-input w-full p-3 text-sm resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-md font-medium text-sm"
                    style={{ background: 'var(--navy)', color: 'var(--paper-raised)' }}
                  >
                    Create ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('list')}
                    className="flex-1 py-2.5 rounded-md font-medium text-sm"
                    style={{ background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 3: TICKET DETAIL */}
        {currentView === 'detail' && selectedTicket && (
          <div className="max-w-2xl mx-auto fade-in">
            <button
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2 text-sm font-medium mb-4"
              style={{ color: 'var(--ink-soft)' }}
            >
              <ArrowLeft size={15} /> Back
            </button>

            <div className="panel overflow-hidden">
              <div className="p-7" style={{ borderBottom: '1px solid var(--line)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs font-semibold" style={{ color: 'var(--navy)' }}>
                    {selectedTicket.ticket_id}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                    {new Date(selectedTicket.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <span
                    className="ml-auto inline-flex items-center justify-center w-6 h-6 rounded font-mono text-xs font-semibold"
                    style={{
                      background: (PRIORITY_TOKEN[selectedTicket.priority] || PRIORITY_TOKEN.Medium).bg,
                      color: (PRIORITY_TOKEN[selectedTicket.priority] || PRIORITY_TOKEN.Medium).fg,
                    }}
                    title={selectedTicket.priority}
                  >
                    {(PRIORITY_TOKEN[selectedTicket.priority] || PRIORITY_TOKEN.Medium).label}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold leading-tight mb-4">{selectedTicket.subject}</h2>

                <div className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ background: 'var(--navy-soft)', color: 'var(--navy)' }}
                  >
                    {getInitials(selectedTicket.customer_name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedTicket.customer_name}</p>
                    <a
                      href={`mailto:${selectedTicket.customer_email}`}
                      className="text-xs flex items-center gap-1"
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      <Mail size={11} /> {selectedTicket.customer_email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-7" style={{ borderBottom: '1px solid var(--line)' }}>
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--ink-soft)' }}>Lifecycle — tap a stage to update</p>
                <Stepper
                  status={selectedTicket.status}
                  size="lg"
                  onSelect={(stage) => updateTicketStatus(selectedTicket.ticket_id, stage)}
                />
              </div>

              <div className="p-7">
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--ink-soft)' }}>Description</p>
                <div
                  className="p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed"
                  style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}
                >
                  {selectedTicket.description}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
