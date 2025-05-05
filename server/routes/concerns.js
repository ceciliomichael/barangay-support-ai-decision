import express from 'express';
import Concern from '../models/concern.js';
import Resident from '../models/resident.js';
import { processWithAI, processAllPendingConcerns } from '../services/aiService.js';

const router = express.Router();

// GET all concerns (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { status, residentId } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter['verification.status'] = status;
    }
    
    if (residentId) {
      filter.residentId = residentId;
    }
    
    // Get concerns with populated resident names
    const concerns = await Concern.find(filter)
      .populate('residentId', 'name email avatar')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: concerns
    });
  } catch (error) {
    console.error('Error fetching concerns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch concerns',
      error: error.message
    });
  }
});

// GET a specific concern by ID
router.get('/:id', async (req, res) => {
  try {
    const concern = await Concern.findById(req.params.id)
      .populate('residentId', 'name email avatar');
    
    if (!concern) {
      return res.status(404).json({
        success: false,
        message: 'Concern not found'
      });
    }
    
    res.json({
      success: true,
      data: concern
    });
  } catch (error) {
    console.error('Error fetching concern:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch concern',
      error: error.message
    });
  }
});

// POST a new concern
router.post('/', async (req, res) => {
  try {
    const { text, residentId } = req.body;
    
    // Validate required fields
    if (!text || !residentId) {
      return res.status(400).json({
        success: false,
        message: 'Text and residentId are required'
      });
    }
    
    // Check if resident exists
    const resident = await Resident.findById(residentId);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }
    
    // Create concern
    const concern = new Concern({
      text,
      residentId,
      timestamp: new Date(),
      verification: {
        status: 'pending',
        aiSuggestion: null
      }
    });
    
    // Save concern
    const savedConcern = await concern.save();
    
    // Process with AI asynchronously (don't wait for this to complete)
    processWithAI(savedConcern).catch(error => {
      console.error('Error processing concern with AI:', error);
    });
    
    res.status(201).json({
      success: true,
      data: savedConcern,
      message: 'Concern submitted successfully and is being processed by AI'
    });
  } catch (error) {
    console.error('Error creating concern:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit concern',
      error: error.message
    });
  }
});

// PUT update a concern (for admin overrides)
router.put('/:id', async (req, res) => {
  try {
    const { verification } = req.body;
    
    // Validate status if provided
    if (verification && verification.status && !['pending', 'approved', 'rejected'].includes(verification.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be: pending, approved, or rejected'
      });
    }
    
    // Find and update concern
    const updatedConcern = await Concern.findByIdAndUpdate(
      req.params.id,
      { $set: { verification } },
      { new: true, runValidators: true }
    ).populate('residentId', 'name email avatar');
    
    if (!updatedConcern) {
      return res.status(404).json({
        success: false,
        message: 'Concern not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedConcern,
      message: 'Concern updated successfully'
    });
  } catch (error) {
    console.error('Error updating concern:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update concern',
      error: error.message
    });
  }
});

// POST trigger AI processing for all pending concerns
router.post('/process-all', async (req, res) => {
  try {
    const results = await processAllPendingConcerns();
    
    res.json({
      success: true,
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      message: 'Concerns processing complete'
    });
  } catch (error) {
    console.error('Error processing concerns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process concerns',
      error: error.message
    });
  }
});

export default router; 