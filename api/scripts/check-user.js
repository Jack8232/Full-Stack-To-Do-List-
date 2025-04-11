const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/auth-todo')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Define the User schema manually (to avoid import issues)
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      username: String
    });
    
    // Create the User model
    const User = mongoose.model('User', userSchema);
    
    try {
      // Find all users
      const users = await User.find({});
      
      console.log('Total users:', users.length);
      
      // Log each user (excluding password)
      users.forEach((user, i) => {
        console.log(`User ${i + 1}:`, {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          hasUsername: Boolean(user.username)
        });
      });
    } catch (error) {
      console.error('Error checking users:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }); 