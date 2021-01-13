import React, { Component } from 'react';
import { from, interval, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, map, mergeMap, startWith, take, tap,  } from 'rxjs/operators';
import { PortInfo } from 'serialport';
import { useStatefulObservable } from '@/common/RxTools';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { portInfo$ } from '@/component/serialport/SerialPortDriver';
import { Height } from '@material-ui/icons';

import { Network, Node, Edge } from '@lifeomic/react-vis-network';
 
export class ConnectorDiagram extends Component {
  render() {
    return (
      <Network>
        <Node id="vader" label="Darth Vader" />
        <Node id="luke" label="Luke Skywalker" />
        <Node id="leia" label="Leia Organa" />
        <Edge id="1" from="vader" to="luke" />
        <Edge id="2" from="vader" to="leia" />
      </Network>
    );
  }
}