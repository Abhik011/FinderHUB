const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3001; // Replace with your desired port number

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://clearbiller:DKnvsIZBvHjsjmmN@cluster0.eipii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  campusId: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Faculty', 'Staff'], required: true },
});

const User = mongoose.model('User', userSchema);

// Routes
// 1. Register a new user
app.post('/register', async (req, res) => {
  const { fullName, email, password, confirmPassword, phoneNumber, campusId, role } = req.body;

  // Check required fields
  if (!fullName || !email || !password || !confirmPassword || !phoneNumber || !campusId || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate password and confirm password
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      campusId,
      role,
    });

    // Save the user in the database
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'User registration failed', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
