const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.get('/available-slots', patientController.getAvailableSlots);
router.post('/book-appointment', patientController.bookAppointment);
router.get('/my-bookings', patientController.viewBookings);

module.exports = router;