import React, { useEffect } from 'react'
import { BehaviorSubject, from, interval, merge, NEVER, of, Subject } from 'rxjs'
import { map, filter, mergeMap, delay, tap, mapTo, startWith, switchMap, throttle, delayWhen } from 'rxjs/operators'
import { useStatefulObservable, useObservableBehaviourOf, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { MspMsg, mspRequest, mspResponse$ } from '@/component/msp/MspDriver'
import { viewMspMsg } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, FormControlLabel, NativeSelect, Switch, TextField } from '@material-ui/core'
import { Line } from 'react-chartjs-2'

const notEmpty = v => v != ""

export const MspGraph = () => {
  const [state, changeState, state$] = useObservableBehaviourOf({
    checked: false,
    interval: 100,
    cmd: ""
  });
  const mspMsg = useStatefulObservable<number>(mspResponse$
    .pipe(
      // map(mspMsg  => viewMspMsg[mspMsg.cmd](mspMsg))
      mapTo(Math.random())
  ))
  // useEffect(() => {
  //   const sub = state$
  //     .pipe(
  //       startWith(state.checked),
  //       switchMap(v => (v ? interval(state.interval) : NEVER)),
  //       mapTo(state.cmd),
  //     )
  //     .subscribe(v => {
  //       console.log(v)
  //       mspRequest(v,[])
  //     })
  //   return () => sub.unsubscribe()
  // }, [state$])
  // useEffect(() => {
  //   const sub = state$
  //     .pipe(
  //       startWith(state.checked),
  //       switchMap(v => (v ? interval(state.interval) : NEVER)),
  //       mapTo(state.cmd),
  //       tap(v => mspRequest(v,[])),
  //       switchMap(_ => mspResponse$),
  //     )
  //     .subscribe(v => {
  //       console.log(v.cmd)
  //     })
  //   return () => sub.unsubscribe()
  // }, [state$])
  useEffect(() => {
    const sub = merge(state$,mspResponse$)
      .pipe(
        startWith(state.checked),
        filter(v => v == true),
        delayWhen(_ => interval(state.interval)),
        mapTo(state.cmd),
        tap(v => mspRequest(v,[])),
        switchMap(_ => mspResponse$),
      )
      .subscribe(v => {
        console.log(v.cmd)
      })
    return () => sub.unsubscribe()
  }, [state$, mspResponse$])
  return (
    <React.Fragment>
      {/* <TextField label="cmd" value={state.cmd} onChange={e => changeState({ cmd: e.target.value })} /> */}
      <NativeSelect value={state.cmd} onChange={e => changeState({ cmd: e.target.value })}>
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <FormControlLabel
        control={<Switch checked={state.checked} color="secondary" onChange={_ => changeState({ checked: !state.checked })}/>}
        label="Connect"
      />
      {mspMsg}
      <Line
        data={{
          datasets: [{
            label: 'Dataset 1',
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            lineTension: 0,
            borderDash: [8, 4]
          }, {
            label: 'Dataset 2',
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
          }]
        }}
        options={{
          scales: {
            xAxes: [{
              realtime: {
                onRefresh: function(chart) {
                  chart.data.datasets.forEach(function(dataset) {
                    dataset.data.push({
                      x: Date.now(),
                      y: Math.random()
                    });
                  });
                },
                delay: 2000
              }
            }]
          }
        }}
      />
    </React.Fragment>
  )
}
