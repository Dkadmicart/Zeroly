# Socket Events

## Connection
- URL: http://localhost:5001
- Client connects using socket.io-client.
- Client passes auth payload: { token: <JWT> }.
- Server currently does not validate the socket auth token.

## Event Summary
| Event | Direction | Payload | Notes |
| --- | --- | --- | --- |
| connect | server -> client | none | Built-in socket.io event. Logged on server. |
| disconnect | server -> client | none | Built-in socket.io event. Logged on server. |
| send-message | client -> server | { roomId, chatId, text, sender, createdAt } | Server broadcasts the same payload to all clients as new-message. |
| new-message | server -> client | { roomId, chatId, text, sender, createdAt } | Broadcast to all clients (no room filtering). |
| joinRoom | client -> server | chatId | Emitted by client, but server does not listen for it yet. |

## Behavior Notes
- Room isolation is not implemented. The server uses io.emit and sends new-message to every connected client.
- The client expects room filtering by comparing msg.chatId to the current chatId.
- If room-based delivery is required, implement a server-side joinRoom handler and emit to the room.

## Example Client Usage

### Emit send-message
socket.emit("send-message", {
  roomId: chatId,
  chatId,
  text: "Hello",
  sender: userId,
  createdAt: new Date().toISOString()
});

### Listen for new-message
socket.on("new-message", (msg) => {
  if (msg.chatId === currentChatId) {
    // update UI
  }
});
