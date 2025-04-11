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
      const users = await User.find({ username: { $exists: false } });
      console.log(`Found ${users.length} users without a username.`);
      
      if (users.length > 0) {
        for (const user of users) {
          const defaultUsername = user.email.split('@')[0];
          await User.updateOne(
            { _id: user._id },
            { $set: { username: defaultUsername } }
          );
          console.log(`Updated user ${user.email} with username: ${defaultUsername}`);
        }
        console.log('All users updated with usernames.');
      }
      
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