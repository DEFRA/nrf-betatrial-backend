// sqsPublisher.js
import {
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";

const sqs = new SQSClient();

/**
 * Publish a message to an SQS queue.
 *
 * @param {object|string} message - JS object or string to send
 */
export async function publishToQueue(message) {
  const body = typeof message === "string" ? message : JSON.stringify(message);
  const command = new GetQueueUrlCommand({QueueName: 'quote_request'});
  const queueUrl = await sqs.send(command);

  const cmd = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: body,
  });

  const result = await sqs.send(cmd);
  return result;  // Contains MessageId, MD5OfMessageBody, etc.
}
