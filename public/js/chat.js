const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("#message");
const $messageFormButton = $messageForm.querySelector("button");
const $sidebar = document.querySelector("#sidebar");
const $sendLocationButton = document.querySelector("#send-location");

const $messages = document.querySelector("#messages");
//Template
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const $locationTemplate =
  document.querySelector("#location-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have we scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = containerHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render($messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("HH:mm:ss"),
    username: message.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (location) => {
  console.log(location);

  const html = Mustache.render($locationTemplate, {
    locationUrl: location.locationUrl,
    createdAt: moment(location.createdAt).format("HH:mm:ss"),
    username: location.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const messageData = $messageFormInput.value;

  socket.emit("sendMessage", messageData, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not available for this browser.");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    socket.emit("sendLocation", position, (error) => {
      $sendLocationButton.removeAttribute("disabled");
      if (error) {
        console.log(error);
      }
      console.log("Location Shared");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
