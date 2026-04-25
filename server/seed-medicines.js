const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const Medicine = require('./models/Medicine');

const seedData = [
  { name: 'Amoxicillin 500mg', batchNo: 'AMX-2023', expiry: '2026-04-28', stockQty: 45, mrp: 120.00, category: 'Antibiotic' },
  { name: 'Paracetamol 650mg', batchNo: 'PCM-109', expiry: '2026-04-30', stockQty: 120, mrp: 35.00, category: 'Analgesic' },
  { name: 'Cetirizine 10mg', batchNo: 'CET-88', expiry: '2026-05-01', stockQty: 30, mrp: 45.50, category: 'Antihistamine' },
  { name: 'Azithromycin 250mg', batchNo: 'AZ-44', expiry: '2025-11-15', stockQty: 1, mrp: 210.00, category: 'Antibiotic' },
  { name: 'Ibuprofen 400mg', batchNo: 'IBU-99', expiry: '2027-02-10', stockQty: 0, mrp: 60.00, category: 'NSAID' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'loksevamedical' });
    console.log('✅ Connected to MongoDB');

    await Medicine.insertMany(seedData);
    console.log('✅ Seeded Medicines successfully!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding:', err);
    process.exit(1);
  }
}

seed();
