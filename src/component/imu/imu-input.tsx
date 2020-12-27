import React, { useState, useEffect } from 'react'
import { fromEvent, Subject } from 'rxjs'
import { map, filter, tap, startWith } from 'rxjs/operators'
import { useObservable } from '@/common/rx-tools'
import { ImuMsg, imuRequest, imuResponse$ } from '@/component/imu/imu-driver'
import { imuOutputFunctions } from '@/component/imu/imu-view'
import { ImuCmd } from '@/component/imu/imu-protocol'
import { Button, NativeSelect } from '@material-ui/core'

export const ImuInput = props => {
  const imuOutput = useObservable(imuResponse$
    .pipe(
      map(ImuMsg  => imuOutputFunctions[(ImuMsg as ImuMsg).cmd](ImuMsg))))
  useEffect(() => {
    const imuButton = document.getElementById('imuButton')
    const imuInput = document.getElementById('imuInput')
    const click$ = fromEvent(imuButton, 'click')
      .pipe(
        map(event => (imuInput as HTMLInputElement).value),
        filter(value => value != "")
      )
    const sub = click$
      .subscribe(val => {
        imuRequest(val,[])
      })
    return () => sub.unsubscribe()
  });
  return (
    <React.Fragment>
      <NativeSelect id="imuInput">
        <option aria-label="None" value="">None</option>
        {Object.keys(ImuCmd).map(key =>
          <option key={ImuCmd[key]} value={ImuCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button id="imuButton" variant="contained" color="secondary">IMU Go</Button>
      <div>{imuOutput}</div>
    </React.Fragment>
  )
}
