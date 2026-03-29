const fs = require('fs/promises');
const path = require('path');
const { EventEmitter } = require('events');

/**
 * ════════════════════════════════════════════════════════════════════
 *  DECOUPLED BACKGROUND QUEUE SERVICE (SDE SENIOR PATTERN)
 * ════════════════════════════════════════════════════════════════════
 *  Current Implementation: In-Memory (using Async EventEmitter)
 *  Production Upgrade: Swap this Class for 'BullMQ' with Redis.
 *  
 *  This ensures that File Cleanup happens asynchronously without 
 *  blocking the API response, maintaining <100ms latency.
 * ════════════════════════════════════════════════════════════════════
 */
class BackgroundQueue extends EventEmitter {
  constructor() {
    super();
    this.on('cleanup-files', this.processCleanup.bind(this));
  }

  /**
   * Enqueue a job (Producer)
   * Mirrors BullMQ.add()
   */
  async add(name, data) {
    console.log(`[Queue] Enqueued job: ${name}`);
    // We use setImmediate to ensure this runs in the next event loop cycle,
    // completely freeing up the current request stack.
    setImmediate(() => {
      this.emit(name, data);
    });
  }

  /**
   * The Worker Logic (Consumer)
   * Handles idempotency and resilience.
   */
  async processCleanup({ filenames }) {
    if (!filenames || filenames.length === 0) return;

    for (const filename of filenames) {
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      
      try {
        // IDEMPOTENCY CHECK: Don't crash if file already gone
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        
        if (exists) {
          await fs.unlink(filePath);
          console.log(`[Worker] Successfully purged storage: ${filename}`);
        }
      } catch (err) {
        console.error(`[Worker] Failed to purge ${filename}: ${err.message}`);
        // In a real BullMQ setup, we would 'throw' to trigger a retry with backoff.
      }
    }
  }
}

// Singleton instance for the entire app
const queueService = new BackgroundQueue();

module.exports = queueService;
