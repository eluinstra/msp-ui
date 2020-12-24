import React from 'react'
import { from, Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PortInfo } from 'serialport';
import { useObservable } from '@/common/rx-tools';
import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { portInfo$ } from '@/component/serialport/serialport-driver';

const useStyles = makeStyles({
  tableRow: {
    "&.MuiTableRow-head": {
      "& > .MuiTableCell-head": {
        fontWeight: "bold"
      }
    }
  }
});

export const Ports = () => {
  const classes = useStyles();
  const portInfo = useObservable(portInfo$()
    .pipe(
      // startWith([]),
      map(p => (p as PortInfo[])
        .filter(o => o.manufacturer != undefined)
        .map(o =>
          <TableRow key={o.path}>
            <TableCell>{o.path}</TableCell>
            <TableCell>{o.manufacturer}</TableCell>
            <TableCell>{o.serialNumber}</TableCell>
            <TableCell>{o.pnpId}</TableCell>
            <TableCell>{o.locationId}</TableCell>
            <TableCell>{o.productId}</TableCell>
            <TableCell>{o.vendorId}</TableCell>
          </TableRow>)
  )))
  return (
    <React.Fragment>
      <h2>Ports</h2>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell>path</TableCell>
              <TableCell>manufacturer</TableCell>
              <TableCell>serialNumber</TableCell>
              <TableCell>pnpId</TableCell>
              <TableCell>locationId</TableCell>
              <TableCell>productId</TableCell>
              <TableCell>vendorId</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {portInfo.map(o => <TableRow key={o.path}>
              <TableCell component="th" scope="row">{o.path}</TableCell>
              <TableCell>{o.manufacturer}</TableCell>
              <TableCell>{o.serialNumber}</TableCell>
              <TableCell>{o.pnpId}</TableCell>
              <TableCell>{o.locationId}</TableCell>
              <TableCell>{o.productId}</TableCell>
              <TableCell>{o.vendorId}</TableCell>
            </TableRow>)} */}
            {portInfo}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  )
}
