const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/auth-todo')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      username: String
    });
    
    const User = mongoose.model('User', userSchema);
    
    try {
      const users = await User.find({});
      
      console.log('Total users:', users.length);
      
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