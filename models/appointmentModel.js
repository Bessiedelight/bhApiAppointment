const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorGmail: { type: String, required: true },
  patientHospitalId: { type: String, required: true },
  patientName: { type: String, required: true },
  slot: {
    date: { type: Date, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  urgency: { type: String, enum: ['red', 'yellow', 'blue'], required: true },
  status: { type: String, default: 'pending' },
  acceptedSlot: { type: String, enum: ['yes', 'no'], default: 'no' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', appointmentSchema);