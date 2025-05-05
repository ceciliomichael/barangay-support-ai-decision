import mongoose from 'mongoose';

const residentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  avatar: {
    type: String,
    default: () => `https://api.dicebear.com/7.x/notionists/svg?seed=${Date.now()}`
  }
}, {
  timestamps: true
});

// Generate a random ID for testing purposes
residentSchema.statics.createTestResident = async function() {
  const names = [
    'Maria Santos', 'Juan Dela Cruz', 'Ana Reyes', 'Pedro Mendoza',
    'Elena Bautista', 'Miguel Gonzales', 'Sofia Dizon', 'Rafael Cruz'
  ];
  
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomEmail = `${randomName.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
  
  const resident = new this({
    name: randomName,
    email: randomEmail
  });
  
  return resident.save();
};

const Resident = mongoose.model('Resident', residentSchema);

export default Resident; 