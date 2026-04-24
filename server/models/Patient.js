const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Patient full name is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: '',
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: '',
  },
  fullAddress: {
    type: String,
    trim: true,
    default: '',
  },
  currentMedicine: {
    type: String,
    trim: true,
    default: '',
  },
  patientDisease: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
