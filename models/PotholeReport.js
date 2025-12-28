const mongoose = require('mongoose');

const PotholeReportSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  location: {
    address: { type: String, required: true, trim: true },
    lat: { type: Number },
    lng: { type: Number }
  },
  description: { type: String, trim: true },
  imagePath: { type: String }, // stores /uploads/filename
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PotholeReport', PotholeReportSchema);
