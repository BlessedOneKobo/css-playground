const socket = new WebSocket("ws://localhost:6969");
socket.addEventListener("message", (event) => {
  if (event.data === "change") {
    window.location.reload();
  }
})
