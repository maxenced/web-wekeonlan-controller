import wol from 'wake_on_lan';

export function sendWol(mac: string): Promise<void> {
  return new Promise((resolve, reject) => {
    wol.wake(mac, { address: '255.255.255.255' }, (err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
