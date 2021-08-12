import { RpcMainHandler } from '@wexond/rpc-electron';
import { SerialPortService, serialPortChannel } from './SerialPortService';

// Equivalent of |ipcMain.handle|
class SerialPortHandler implements RpcMainHandler<SerialPortService> {
  ping(): string {
    return 'pong';
  }
}

serialPortChannel.getReceiver().handler = new SerialPortHandler();
