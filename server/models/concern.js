import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  aiSuggestion: {
    type: String,
    default: null
  },
  aiReason: {
    type: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  category: {
    type: String,
    enum: [
      'waste_collection',
      'recycling',
      'containers',
      'illegal_dumping',
      'public_cleanliness',
      'dead_animal',
      'hazardous_waste',
      'drainage',
      'odor_pests',
      'scheduling',
      'service_access',
      'commercial_promotion',
      'personal_dispute',
      'out_of_scope',
      'nonsensical',
      'inappropriate',
      'unrelated',
      'vague',
      'impossible',
      'other'
    ]
  },
  processedAt: {
    type: Date
  }
});

const concernSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  verification: {
    type: verificationSchema,
    default: () => ({
      status: 'pending',
      aiSuggestion: null
    })
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add virtual for the residentName (populated from the Resident model)
concernSchema.virtual('residentName', {
  ref: 'Resident',
  localField: 'residentId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name' }
});

// Set toJSON and toObject to include virtuals
concernSchema.set('toJSON', { virtuals: true });
concernSchema.set('toObject', { virtuals: true });

const Concern = mongoose.model('Concern', concernSchema);

export default Concern; 