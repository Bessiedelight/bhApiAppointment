const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');

// Get available slots for a doctor on a date
exports.getAvailableSlots = async (req, res) => {
  const { doctorGmail, date } = req.query;

  try {
    const doctor = await Doctor.findOne({ gmail: doctorGmail });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const availability = doctor.availability.find(
      (avail) => avail.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (!availability) return res.status(200).json({ slots: [] });

    const availableSlots = availability.slots.filter((slot) => !slot.booked);
    res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots', error });
  }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
  const { doctorGmail, patientHospitalId, patientName, slot, title, summary, urgency } = req.body;

  try {
    const doctor = await Doctor.findOne({ gmail: doctorGmail });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const availability = doctor.availability.find(
      (avail) => avail.date.toISOString().split('T')[0] === new Date(slot.date).toISOString().split('T')[0]
    );

    if (!availability) return res.status(400).json({ message: 'No availability on this date' });

    const slotIndex = availability.slots.findIndex(
      (s) => s.start === slot.start && s.end === slot.end && !s.booked
    );

    if (slotIndex === -1) return res.status(400).json({ message: 'Slot not available' });

    const appointment = new Appointment({
      doctorGmail,
      patientHospitalId,
      patientName,
      slot,
      title,
      summary,
      urgency,
    });

    availability.slots[slotIndex].booked = true;
    await Promise.all([doctor.save(), appointment.save()]);
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment', error });
  }
};

// View patient's bookings
exports.viewBookings = async (req, res) => {
  const { patientHospitalId } = req.query;

  try {
    const bookings = await Appointment.find({ patientHospitalId });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

// Approve an appointment
exports.approveAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { acceptedSlot: 'yes' },
      { new: true } // Return the updated document
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment approved successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error approving appointment', error });
  }
};