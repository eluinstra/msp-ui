import 'module-alias/register';
import { ipcRenderer } from 'electron'
import { registerSerialPortWorkerEvents } from '@/component/serialport/SerialPortWorker';
import React from 'react';
import ReactDOM from 'react-dom';
import './i18n';
import { App } from './App';

registerSerialPortWorkerEvents(ipcRenderer);

ReactDOM.render(<App />, document.getElementById('app'));
