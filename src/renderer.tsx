import 'module-alias/register';
import { ipcRenderer } from 'electron'
import { createSerialPortDriver } from '@/component/serialport/SerialPortDriverWorker';
import React from 'react';
import ReactDOM from 'react-dom';
import './i18n';
import { App } from './App';

createSerialPortDriver(ipcRenderer);

ReactDOM.render(<App />, document.getElementById('app'));
