/**
 * User Model
 * Defines the schema for MongoDB.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  question1: {
    type: String,
    default: "What is your birth place?"
  },
  answer1Hash: {
    type: String,
    required: true
  },
  question2: {
    type: String,
    default: "What is your 1st vehicle?"
  },
  answer2Hash: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
