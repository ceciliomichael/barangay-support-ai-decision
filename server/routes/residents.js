import express from 'express';
import Resident from '../models/resident.js';

const router = express.Router();

// GET all residents
router.get('/', async (req, res) => {
  try {
    const residents = await Resident.find().sort({ name: 1 });
    
    res.json({
      success: true,
      data: residents
    });
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch residents',
      error: error.message
    });
  }
});

// GET a specific resident by ID
router.get('/:id', async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }
    
    res.json({
      success: true,
      data: resident
    });
  } catch (error) {
    console.error('Error fetching resident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resident',
      error: error.message
    });
  }
});

// POST a new resident
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    // Check if email already exists
    const existingResident = await Resident.findOne({ email });
    if (existingResident) {
      return res.status(400).json({
        success: false,
        message: 'A resident with this email already exists'
      });
    }
    
    // Create resident
    const resident = new Resident({
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${Date.now()}`
    });
    
    // Save resident
    const savedResident = await resident.save();
    
    res.status(201).json({
      success: true,
      data: savedResident,
      message: 'Resident created successfully'
    });
  } catch (error) {
    console.error('Error creating resident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resident',
      error: error.message
    });
  }
});

// POST create test resident (for development)
router.post('/create-test', async (req, res) => {
  try {
    const resident = await Resident.createTestResident();
    
    res.status(201).json({
      success: true,
      data: resident,
      message: 'Test resident created successfully'
    });
  } catch (error) {
    console.error('Error creating test resident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test resident',
      error: error.message
    });
  }
});

export default router; 