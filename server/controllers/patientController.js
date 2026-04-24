const Patient = require('../models/Patient');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res) => {
  try {
    const {
      fullName,
      age,
      phoneNumber,
      gender,
      bloodGroup,
      fullAddress,
      currentMedicine,
      patientDisease
    } = req.body;

    const patient = await Patient.create({
      fullName,
      age,
      phoneNumber,
      gender,
      bloodGroup,
      fullAddress,
      currentMedicine,
      patientDisease
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
  try {
    const {
      fullName,
      age,
      phoneNumber,
      gender,
      bloodGroup,
      fullAddress,
      currentMedicine,
      patientDisease
    } = req.body;

    const patient = await Patient.findById(req.params.id);

    if (patient) {
      patient.fullName = fullName || patient.fullName;
      patient.age = age || patient.age;
      patient.phoneNumber = phoneNumber || patient.phoneNumber;
      patient.gender = gender !== undefined ? gender : patient.gender;
      patient.bloodGroup = bloodGroup !== undefined ? bloodGroup : patient.bloodGroup;
      patient.fullAddress = fullAddress !== undefined ? fullAddress : patient.fullAddress;
      patient.currentMedicine = currentMedicine !== undefined ? currentMedicine : patient.currentMedicine;
      patient.patientDisease = patientDisease !== undefined ? patientDisease : patient.patientDisease;

      const updatedPatient = await patient.save();
      res.json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      await patient.deleteOne();
      res.json({ message: 'Patient removed' });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
};
