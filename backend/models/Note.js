const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  ticket_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket', 
    required: true 
  },
  note_text: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Note', noteSchema);