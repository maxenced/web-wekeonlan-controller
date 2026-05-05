import { describe, it, expect, vi } from 'vitest';
import { sendWol } from '../../src/wol/wol.js';

vi.mock('wake_on_lan', () => ({
  default: {
    wake: vi.fn((mac: string, opts: unknown, cb: (err: Error | null) => void) => cb(null)),
  },
}));

import wol from 'wake_on_lan';

describe('sendWol', () => {
  it('sends a magic packet to the given MAC address', async () => {
    await sendWol('AA:BB:CC:DD:EE:FF');
    expect(wol.wake).toHaveBeenCalledWith(
      'AA:BB:CC:DD:EE:FF',
      expect.any(Object),
      expect.any(Function),
    );
  });

  it('rejects when wake_on_lan returns an error', async () => {
    vi.mocked(wol.wake).mockImplementation((mac, opts, cb: any) => {
      cb(new Error('send failed'));
    });
    await expect(sendWol('AA:BB:CC:DD:EE:FF')).rejects.toThrow('send failed');
  });
});
