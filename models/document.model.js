const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  health_record_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthRecord',
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  file_type: {
    type: String,
    required: true
  },
  document_name: {
    type: String
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;
