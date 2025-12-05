import {
  EventProcessor,
  MemoryAuthProvider,
  IEventContext,
  IBroadcastEvent,
} from '../lib/index.js';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

let processorInstance: EventProcessor | null = null;

export async function initializeEventProcessor(): Promise<EventProcessor> {
  if (processorInstance) {
    return processorInstance;
  }

  const processor = new EventProcessor({
    redis: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
    incomingChannel: 'events:stickyNotes',
    outgoingChannel: 'events:broadcast',
    enableLogging: true,
  });

  const authProvider = new MemoryAuthProvider();

  processor.setAuthProvider(authProvider);

  await processor.start();

  processorInstance = processor;

  console.log('✓ Event Processor инициализирован');
  console.log(`✓ Redis: ${REDIS_HOST}:${REDIS_PORT}`);

  return processor;
}

export function getEventProcessor(): EventProcessor {
  if (!processorInstance) {
    throw new Error('Event Processor not initialized. Call initializeEventProcessor() first.');
  }
  return processorInstance;
}

export async function stopEventProcessor(): Promise<void> {
  if (processorInstance) {
    await processorInstance.stop();
    processorInstance = null;
  }
}
