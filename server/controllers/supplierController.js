const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private
const createSupplier = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      phoneNumber,
      email,
      gstin,
      address,
      status
    } = req.body;

    const supplier = await Supplier.create({
      name,
      contactPerson,
      phoneNumber,
      email,
      gstin,
      address,
      status
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      phoneNumber,
      email,
      gstin,
      address,
      status
    } = req.body;

    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      supplier.name = name || supplier.name;
      supplier.contactPerson = contactPerson !== undefined ? contactPerson : supplier.contactPerson;
      supplier.phoneNumber = phoneNumber || supplier.phoneNumber;
      supplier.email = email !== undefined ? email : supplier.email;
      supplier.gstin = gstin !== undefined ? gstin : supplier.gstin;
      supplier.address = address !== undefined ? address : supplier.address;
      supplier.status = status || supplier.status;

      const updatedSupplier = await supplier.save();
      res.json(updatedSupplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      await supplier.deleteOne();
      res.json({ message: 'Supplier removed' });
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
