const Ticket = require('../models/Ticket');

// Helper to generate unique ticket ID (e.g., TKT-1001)
const generateTicketId = async () => {
  const count = await Ticket.countDocuments();
  return `TKT-${1001 + count}`;
};

// 1. POST /api/tickets - Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { customer_name, customer_email, subject, description, priority } = req.body;
    
    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const ticket_id = await generateTicketId();

    const newTicket = new Ticket({
      ticket_id,
      customer_name,
      customer_email,
      subject,
      description,
      priority: priority || 'Medium'
    });

    const savedTicket = await newTicket.save();
    res.status(201).json({
      ticket_id: savedTicket.ticket_id,
      created_at: savedTicket.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET /api/tickets - List all tickets with optional search & filter
exports.getTickets = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { customer_name: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } },
        { ticket_id: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    
    // Format response to match spec
    const formattedTickets = tickets.map(t => ({
      ticket_id: t.ticket_id,
      customer_name: t.customer_name,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      created_at: t.createdAt
    }));

    res.json(formattedTickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. GET /api/tickets/:ticket_id - Get single ticket details
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticket_id: req.params.ticket_id });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. PUT /api/tickets/:ticket_id - Update status and/or add notes
exports.updateTicket = async (req, res) => {
  try {
    const { status, priority } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    updateData.updated_at = Date.now();

    const updatedTicket = await Ticket.findOneAndUpdate(
      { ticket_id: req.params.ticket_id },
      updateData,
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      success: true,
      updated_at: updatedTicket.updated_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};