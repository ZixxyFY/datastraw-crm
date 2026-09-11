const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticket_id: { type: String, required: true, unique: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Closed'], 
    default: 'Open' 
  },
  priority: { // The "Stand Out" feature we discussed
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  }
}, { timestamps: true }); // Automatically handles created_at and updated_at

module.exports = mongoose.model('Ticket', ticketSchema);