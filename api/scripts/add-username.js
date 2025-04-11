const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/auth-todo')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Define the User schema manually
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      username: String
    });
    
    // Create the User model
    const User = mongoose.model('User', userSchema);
    
    try {
      // Find all users without a username
      const users = await User.find({ username: { $exists: false } });
      console.log(`Found ${users.length} users without a username.`);
      
      if (users.length > 0) {
        // Update each user to add a username based on their email
        for (const user of users) {
          // Use part of email before @ as username
          const defaultUsername = user.email.split('@')[0];
          await User.updateOne(
            { _id: user._id },
            { $set: { username: defaultUsername } }
          );
          console.log(`Updated user ${user.email} with username: ${defaultUsername}`);
        }
        console.log('All users updated with usernames.');
      }
      
      // Show updated users
      const updatedUsers = await User.find({});
      console.log('Updated users:');
      updatedUsers.forEach((user, i) => {
        console.log(`User ${i + 1}:`, {
          id: user._id.toString(),
          email: user.email,
          username: user.username
        });
      });
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }); 