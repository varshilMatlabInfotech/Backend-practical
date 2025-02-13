const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({ username, email, password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT payload and token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

 
 // Get friend count and friend details for the logged-in user
exports.getFriendCount = async (req, res, next) => {
    try {
      // Extract the user ID from the token (set by auth middleware)
      const userId = req.user.userId;
      
      // Find the user and populate the 'friends' field with the username and email
      const user = await User.findById(userId).populate('friends', 'username email');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Calculate the number of friends
      const friendCount = user.friends ? user.friends.length : 0;
      
      // Return the count along with the detailed friend list
      res.status(200).json({ friendCount, friends: user.friends });
    } catch (error) {
      next(error);
    }
  };
  
