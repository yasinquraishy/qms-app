/**
 * Broadcast a message to all main-thread clients (tabs) of this origin.
 * @param {object} msg
 */
export async function broadcastMessage(msg) {
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage(msg);
  }
}
