const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.post('/set-availability', doctorController.setAvailability);
router.get('/appointments', doctorController.viewAppointments);
router.get('/', doctorController.getAllDoctors);
module.exports = router;