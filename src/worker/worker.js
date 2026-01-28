export async function worker(message) {
  const body = JSON.parse(msg.Body);
  console.log("[SQS] Processing message:", body);
}