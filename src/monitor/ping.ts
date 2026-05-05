import { promise as pingPromise } from 'ping';

export async function pingHost(host: string, timeoutSeconds = 3): Promise<boolean> {
  try {
    const result = await pingPromise.probe(host, { timeout: timeoutSeconds });
    return result.alive;
  } catch {
    return false;
  }
}
