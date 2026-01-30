import { parentPort, workerData } from 'worker_threads'

function doHeavyComputation(payload) {
  const body = JSON.parse(payload.Body)
  console.log('[SQS] Processing message:', body)

  // Example: simulate heavy CPU work for ~7 seconds
  const end = Date.now() + 7_000
  let x = 0

  while (Date.now() < end) {
    x += Math.sqrt(Math.random()) * Math.random()
  }

  console.log('[SQS] Processed message:',  {
    input: payload,
    result: x,
    finishedAt: new Date().toISOString()
  })

  return {
    input: payload,
    result: x,
    finishedAt: new Date().toISOString()
  }
}

try {
  const payload = workerData
  const result = doHeavyComputation(payload)
  parentPort.postMessage({ ok: true, result })
} catch (err) {
  parentPort.postMessage({ ok: false, error: err.message || String(err) })
}
