const express = require('express');
const router = express.Router();
const { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/')
  .get(authMiddleware, getMedicines)
  .post(authMiddleware, createMedicine);

router.route('/:id')
  .get(authMiddleware, getMedicineById)
  .put(authMiddleware, updateMedicine)
  .delete(authMiddleware, deleteMedicine);

module.exports = router;
