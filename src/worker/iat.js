import { parentPort, workerData } from 'worker_threads'
import { createLogger } from '../common/helpers/logging/logger.js'

function doHeavyComputation(payload) {
  const logger = createLogger()
  const body = JSON.parse(payload.Body)
  logger.info('[SQS] Processing message: ')
  logger.info(body)

  // Example: simulate heavy CPU work for ~7 seconds
  const end = Date.now() + 7_000
  let x = 0

  while (Date.now() < end) {
    x += Math.sqrt(Math.random()) * Math.random()
  }

  logger.info('[SQS] Processed message: ')
  logger.info({
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
