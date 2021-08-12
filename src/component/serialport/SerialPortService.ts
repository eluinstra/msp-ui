import { RendererToMainChannel } from '@wexond/rpc-electron';

export interface SerialPortService {
  ping(): string;
}

export const serialPortChannel = new RendererToMainChannel<SerialPortService>('SerialPortService');