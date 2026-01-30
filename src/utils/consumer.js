import { config } from '../config.js'
import {
  SQSClient,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand
} from '@aws-sdk/client-sqs'
import { createLogger } from '../common/helpers/logging/logger.js'

const sqs = new SQSClient({
  region: config.get('awsRegion'),
  endpoint: config.get('sqsEndpoint')
})
const logger = createLogger()

// Exported state for healthcheck
export const sqsState = {
  running: false,
  lastPollAt: null,
  lastMessageAt: null,
  lastError: null
}

async function pollQueue({ handleMessage, stopSignal }) {
  // Resolve the queue URL once at startup
  const command = new GetQueueUrlCommand({ QueueName: 'quote_request' })
  const queueUrl = (await sqs.send(command)).QueueUrl

  sqsState.running = true

  while (!stopSignal.stop) {
    try {
      sqsState.lastPollAt = new Date()

      const resp = await sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: 1, // 1 message at a time
          WaitTimeSeconds: 20, // long polling
          VisibilityTimeout: 120 // give worker enough time
        })
      )

      const messages = resp.Messages ?? []

      if (messages.length === 0) {
        continue
      }

      for (const msg of messages) {
        try {
          sqsState.lastMessageAt = new Date()

          // Your heavy work (via worker thread) will be inside handleMessage
          await handleMessage(msg)

          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: queueUrl,
              ReceiptHandle: msg.ReceiptHandle
            })
          )
        } catch (err) {
          logger.error('[SQS] Error processing message')
          logger.error(JSON.stringify(err))
          sqsState.lastError = err.message ?? String(err)
          // Do not delete; message will become visible again after visibility timeout
        }
      }
    } catch (err) {
      logger.error('[SQS] Error receiving messages')
      logger.error(JSON.stringify(err))
      sqsState.lastError = err.message ?? String(err)
      // Backoff a bit before retry
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }

  sqsState.running = false
}

// Factory that creates a consumer controller
export function createSqsConsumer({ handleMessage }) {
  const stopSignal = { stop: false }

  const start = async () => {
    // Fire-and-forget background loop
    pollQueue({ handleMessage, stopSignal }).catch((err) => {
      logger.error('[SQS] Fatal consumer error')
      logger.error(JSON.stringify(err))
      sqsState.lastError = err.message ?? String(err)
      sqsState.running = false
    })
  }

  const stop = async () => {
    stopSignal.stop = true
  }

  return { start, stop }
}
