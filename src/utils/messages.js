const generateMessage = (text, username) => {
  return {
    text,
    createdAt: new Date().getTime(),
    username,
  };
};

const generateLocationMessage = (locationUrl, username) => {
  return {
    locationUrl,
    createdAt: new Date().getTime(),
    username,
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage,
};
