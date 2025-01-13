const users = [];

/**
 * addUser function to add a user to the list of users
 * removeUser function to remove a user from the list of users
 * getUser function to get all users
 * getUsersInRoom function to get all users for a room
 */

// addUser function to add a user to the list of users
const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room must be provided",
    };
  }

  // Check for existing user
  const isUserAlreadyExist = users.find((user) => {
    return user.username === username && user.room === room;
  });

  // Validate username
  if (isUserAlreadyExist) {
    return {
      error: "Username is in use!",
    };
  }
  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// Remove user from users list
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// getUser function returns user object by id
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

// getUsersInRoom function returns users list in a specific room
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();

  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
