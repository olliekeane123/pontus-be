import logger from "../../lib/logger";
import sleep from "./sleep";

type BatchProcessingOptions<T, R> = {
  items: T[];
  processFn: (item: T) => Promise<R>;
  batchSize?: number;
  concurrency?: number;
  delayBetweenRequests?: number;
  delayBetweenBatches?: number;
  onBatchComplete?: (batch: T[], results: R[]) => Promise<void>;
}

export async function processInBatches<T, R>({
  items,
  processFn,
  batchSize = 20,
  concurrency = 5,
  delayBetweenRequests = 100,
  delayBetweenBatches = 2000,
  onBatchComplete
}: BatchProcessingOptions<T, R>): Promise<R[]> {
  const results: R[] = [];
  
  // Process items in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(items.length / batchSize);
    
    logger.info(`Processing batch ${batchNumber}/${totalBatches}, size: ${batch.length}`);
    
    // Process each batch with limited concurrency
    const batchResults = await processBatchWithConcurrency({
      batch,
      processFn,
      concurrency,
      delayBetweenRequests,
      batchNumber,
      totalBatches
    });
    
    results.push(...batchResults);
    
    // Execute batch complete callback if provided
    if (onBatchComplete) {
      await onBatchComplete(batch, batchResults);
    }
    
    // Add delay between batches if not the last batch
    if (i + batchSize < items.length) {
      logger.debug(`Waiting ${delayBetweenBatches}ms before next batch`);
      await sleep(delayBetweenBatches);
    }
  }
  
  return results;
}

async function processBatchWithConcurrency<T, R>({
  batch,
  processFn,
  concurrency,
  delayBetweenRequests,
  batchNumber,
  totalBatches
}: {
  batch: T[];
  processFn: (item: T) => Promise<R>;
  concurrency: number;
  delayBetweenRequests: number;
  batchNumber: number;
  totalBatches: number;
}): Promise<R[]> {
  const results: R[] = [];
  let completedCount = 0;
  
  // Create a queue of items to process
  const queue = [...batch];
  
  // Function to process a single item from the queue
  const processQueueItem = async (): Promise<void> => {
    if (queue.length === 0) return;
    
    const item = queue.shift()!;
    try {
      // Add delay between requests
      if (delayBetweenRequests > 0) {
        await sleep(delayBetweenRequests);
      }
      
      // Process the item
      const result = await processFn(item);
      results.push(result);
      
      // Update progress
      completedCount++;
      if (completedCount % 10 === 0 || completedCount === batch.length) {
        const percent = ((completedCount / batch.length) * 100).toFixed(1);
        logger.debug(`Batch ${batchNumber}/${totalBatches}: ${completedCount}/${batch.length} (${percent}%) items processed`);
      }
    } catch (error) {
      logger.error(`Error processing item: ${error}`);
      // Push a null or error result
      results.push(null as unknown as R);
      completedCount++;
    }
    
    // Process next item
    return processQueueItem();
  };
  
  // Start processing with concurrency limit
  const workers = Array(Math.min(concurrency, batch.length))
    .fill(0)
    .map(() => processQueueItem());
  
  // Wait for all workers to complete
  await Promise.all(workers);
  
  return results;
}