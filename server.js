const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
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

const imageSchema = new mongoose.Schema({
  data: String,
  name: String,
  createdAt: { type: Date, default: Date.now },
});
const Image = mongoose.model('Image', imageSchema);

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

app.get("/ping", (req, res) => {
  res.send("pong");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 