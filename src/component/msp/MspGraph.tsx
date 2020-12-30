import React, { useEffect, useState } from 'react'
import { interval, merge, NEVER } from 'rxjs'
import { map, filter, tap, mapTo, startWith, switchMap, delayWhen } from 'rxjs/operators'
import { useStatefulObservable, useObservableBehaviourOf } from '@/common/RxTools'
import { mspRequest, mspResponse$ } from '@/component/msp/MspDriver'
import { MspCmd } from '@/component/msp/MspProtocol'
import { FormControl, FormControlLabel, Switch, TextField } from '@material-ui/core'
import { viewMspGraph } from '@/component/msp/MspGraphView'
import { Autocomplete } from '@material-ui/lab'

export const MspGraph = () => {
  const [state, changeState, state$] = useObservableBehaviourOf({
    checked: false,
    interval: 100,
  });
  const [cmd, setCmd] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const mspMsg = useStatefulObservable<number>(mspResponse$
    .pipe(
      map(mspMsg  => viewMspGraph(mspMsg))
      // mapTo(Math.random())
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
        mapTo(MspCmd[cmd]),
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
      <FormControl>
        <Autocomplete
          value={cmd}
          onChange={(_, v: string) => { setCmd(v) }}
          inputValue={inputValue}
          onInputChange={(_, v) => setInputValue(v)}
          options={Object.keys(MspCmd)}
          getOptionLabel={option => option}
          renderInput={params => <TextField {...params} variant="standard" />}
          style={{ width: 350 }}
        />
      </FormControl>
      <FormControl>
        <FormControlLabel
          control={<Switch checked={state.checked} onChange={_ => changeState({ checked: !state.checked })}/>}
          label="Run"
        />
      </FormControl>
      {mspMsg}
    </React.Fragment>
  )
}
