export async function worker(message) {
  const body = JSON.parse(message.Body)
  console.log('[SQS] Processing message:', body)
}
