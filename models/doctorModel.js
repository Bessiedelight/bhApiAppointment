const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  gmail: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  availability: [
    {
      date: { type: Date, required: true },
      slots: [
        {
          start: { type: String, required: true }, // e.g., "09:00"
          end: { type: String, required: true },   // e.g., "10:00"
          booked: { type: Boolean, default: false },
        },
      ],
    },
  ],
});

module.exports = mongoose.model('Doctor', doctorSchema);