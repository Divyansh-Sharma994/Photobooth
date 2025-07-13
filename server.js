const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://div:db1@cluster1.1kdl6d3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB connection error:', err));
db.once('open', () => console.log('Connected to MongoDB Atlas!'));

// Image schema
const imageSchema = new mongoose.Schema({
  data: String,
  name: String,
  createdAt: { type: Date, default: Date.now },
});

const Image = mongoose.model('Image', imageSchema);

// Upload image endpoint
app.post('/upload', async (req, res) => {
  const { image, name } = req.body;
  console.log('Received upload request');
  console.log('User name:', name);
  
  if (!image) {
    console.log('No image provided in request');
    return res.status(400).send('No image provided');
  }
  
  try {
    const newImage = new Image({ data: image, name });
    await newImage.save();
    console.log('Image saved to MongoDB Atlas');
    res.status(201).send('Image saved');
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).send('Error saving image');
  }
});

// Get all images endpoint
app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find({});
    res.json(images);
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Delete image by ID endpoint
app.delete('/api/images/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid image ID format' });
    }
    
    const deletedImage = await Image.findByIdAndDelete(id);
    
    if (!deletedImage) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    console.log('Image deleted successfully:', id);
    res.json({ message: 'Image deleted successfully', deletedImage });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Health check endpoint
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
