import { useStatefulObservable } from '@/common/RxTools';
import { PortInfo, portInfo$ } from '@/component/serialport/SerialPortDriver';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import React from 'react';
import { interval } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';

export const PortList = () => {
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
          <TableRow>
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
        </TableBody>
      </Table>
    </TableContainer>
  )
}