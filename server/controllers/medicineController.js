const Medicine = require('../models/Medicine');

// @desc    Get all medicines (with optional search)
// @route   GET /api/medicines
// @access  Private
const getMedicines = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const medicines = await Medicine.find(query).sort({ name: 1 }).limit(100);
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMedicines,
};
