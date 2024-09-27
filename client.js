const socket = new WebSocket("ws://127.0.0.1:8000");
socket.addEventListener("message", (event) => {
  if (event.data === "reload") {
    window.location.reload();
  }
})