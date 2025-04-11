import React from 'react';

const UserContext = React.createContext({
  email: '',
  username: '',
  setEmail: () => {},
  setUsername: () => {}
});

export default UserContext;
