import { ipcRenderer, IpcRenderer } from "electron";
import { identity } from 'rxjs'
import { BehaviorSubject, from, Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'

export const registerSerialPortWorkerEvents = (ipcRenderer: IpcRenderer) => {
  console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg); // prints "pong"
  });
  ipcRenderer.send('asynchronous-message', 'ping');
}
