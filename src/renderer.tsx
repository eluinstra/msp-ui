import 'module-alias/register';
import { ipcRenderer } from 'electron'
import React from 'react';
import ReactDOM from 'react-dom';
import './i18n';
import { App } from './App';

ReactDOM.render(<App />, document.getElementById('app'));
