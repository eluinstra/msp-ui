import { remote } from 'electron'
import React from 'react'
import { from, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PortInfo } from 'serialport';
import { useObservable } from '@/common/rx-tools';
import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
const SerialPort = remote.require('serialport')

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export const Ports = () => {
  const classes = useStyles();
  const ports$ = from(SerialPort.list())
  const output = useObservable(ports$
    .pipe(
      map(p => (p as PortInfo[])
        .filter(o => o.manufacturer != undefined)
        .map(o => <TableCell>{o.path}</TableCell>))
    ))
  return <React.Fragment>
      <h2>Ports</h2>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>path</TableCell>
              {/* <TableCell>manufacturer</TableCell>
              <TableCell>serialNumber</TableCell>
              <TableCell>pnpId</TableCell>
              <TableCell>locationId</TableCell>
              <TableCell>productId</TableCell>
              <TableCell>vendorId</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {output}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
}
