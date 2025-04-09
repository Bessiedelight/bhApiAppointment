const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');

// Generate one-hour slots from start to end time
const generateSlots = (startTime, endTime) => {
  const slots = [];
  let [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  while (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
    const nextHour = startHour + 1;
    slots.push({
      start: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
      end: `${nextHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
      booked: false,
    });
    startHour += 1;
  }
  return slots;
};

// Set doctor availability
exports.setAvailability = async (req, res) => {
  const { gmail, date, startTime, endTime } = req.body;

  try {
    const slots = generateSlots(startTime, endTime);
    let doctor = await Doctor.findOne({ gmail });

    if (!doctor) {
      doctor = new Doctor({ gmail, name: req.body.name || gmail.split('@')[0], availability: [] });
    }

    const availabilityIndex = doctor.availability.findIndex(
      (avail) => avail.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (availabilityIndex !== -1) {
      doctor.availability[availabilityIndex].slots.push(...slots);
    } else {
      doctor.availability.push({ date: new Date(date), slots });
    }

    await doctor.save();
    res.status(200).json({ message: 'Availability set successfully', availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ message: 'Error setting availability', error });
  }
};

// View doctor's appointments
exports.viewAppointments = async (req, res) => {
  const { gmail, startDate, endDate } = req.query;

  try {
    const query = { doctorGmail: gmail };
    if (startDate && endDate) {
      query['slot.date'] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const appointments = await Appointment.find(query);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
};

// Get all doctors with reformatted availability (excluding booked slots)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});

    // Transform each doctor into the required format
    const result = doctors.map(doc => {
      // Map over each availability entry
      const slotsdetails = doc.availability.map(avail => {
        // Format the date as YYYY-MM-DD
        const dateStr = avail.date.toISOString().split('T')[0];

        // Filter out slots that are already booked
        const availableSlots = avail.slots.filter(slot => !slot.booked);
        let slotsStr;

        if (availableSlots.length === 0) {
          slotsStr = "[No slots available]";
        } else {
          // Build string for each available slot, marking them as "available"
          slotsStr = '[' + availableSlots.map(slot => `${slot.start}-${slot.end} (available)`).join(', ') + ']';
        }

        return `Availability on ${dateStr}: ${slotsStr}`;
      }).join('; ');

      return {
        doctorname: doc.name,
        doctoremail: doc.gmail,
        slotsdetails: slotsdetails,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors and slots', error });
  }
};