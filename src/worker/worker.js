import { Worker } from 'worker_threads'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function worker(payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      join(__dirname, 'iat.js'),
      {
        workerData: payload
      }
    )

    worker.on('message', (msg) => {
      if (msg.ok) {
        resolve(msg.result)
      } else {
        reject(new Error(msg.error || 'Worker reported error'))
      }
    })

    worker.on('error', (err) => {
      reject(err)
    })

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}




// export async function worker(message) {
//   const body = JSON.parse(message.Body)
//   console.log('[SQS] Processing message:', body)
//   blockFor(10)
//   console.log('[SQS] Processed message:', body)
// }

// function blockFor(seconds) {
//   const end = Date.now() + seconds * 1000;
//   let x = 0;

//   // Perform some meaningless CPU work
//   while (Date.now() < end) {
//     x = Math.sqrt(Math.random()) * Math.random();
//   }

//   console.log("Done blocking.", x);
// }