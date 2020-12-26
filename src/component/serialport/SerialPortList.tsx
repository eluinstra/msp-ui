import React from 'react'
import { from, interval, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, map, mergeMap, startWith, take, tap,  } from 'rxjs/operators';
import { PortInfo } from 'serialport';
import { useStatefulObservable } from '@/common/RxTools';
import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { portInfo$ } from '@/component/serialport/SerialPortDriver';

const useStyles = makeStyles({
  tableRow: {
    "&.MuiTableRow-head": {
      "& > .MuiTableCell-head": {
        fontWeight: "bold"
      }
    }
  }
});

export const PortList = () => {
  const classes = useStyles();
  const portInfo = useStatefulObservable(interval(1000).pipe(take(1))
    .pipe(
      mergeMap(_ => portInfo$()),
      map(p => (p as PortInfo[])
        .filter(o => o.manufacturer != undefined)
  )))
  return (
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
          {portInfo?.map(o => <TableRow key={o.path}>
            <TableCell component="th" scope="row">{o.path}</TableCell>
            <TableCell>{o.manufacturer}</TableCell>
            <TableCell>{o.serialNumber}</TableCell>
            <TableCell>{o.pnpId}</TableCell>
            <TableCell>{o.locationId}</TableCell>
            <TableCell>{o.productId}</TableCell>
            <TableCell>{o.vendorId}</TableCell>
          </TableRow>)}
          {/* {portInfo} */}
        </TableBody>
      </Table>
    </TableContainer>
  )
}