const express = require('express');
const router = express.Router();
const {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/')
  .get(authMiddleware, getPatients)
  .post(authMiddleware, createPatient);

router.route('/:id')
  .put(authMiddleware, updatePatient)
  .delete(authMiddleware, deletePatient);

module.exports = router;
