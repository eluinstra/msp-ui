import { ipcRenderer } from 'electron';
import { serialPortChannel } from './SerialPortService';

const serialPortService = serialPortChannel.getInvoker();

(async () => {
  console.log(await serialPortService.ping()); // Prints `pong`.
})();