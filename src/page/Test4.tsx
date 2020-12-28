import { useObservableBehaviour, useObservableEvent } from '@/common/RxTools'
import { Button } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { Subject } from 'rxjs'
import { combineLatest, map, mapTo, scan } from 'rxjs/operators'
import { withObservableStream } from '@/common/withObservableStream'

export const TestPage = ({
  btnClick
}) => {
  return (
    <React.Fragment>
      <Button variant="contained" color="secondary" onClick={e => btnClick()}>Add</Button>
      <div id="count"/>
    </React.Fragment>
  )
}

const btnSubject = new Subject()
const count = () => document.getElementById("count")
const sub = btnSubject
.pipe(
  scan(count => count + 1, 0)
)
.subscribe(v => {
  console.log(`Clicked ${v} times`)
  count().innerHTML = v.toString()
})

export default withObservableStream(
  combineLatest(
    btnSubject,
    (btnSubject) => ({
      btnSubject
    })
  ),
  {
    bntClick: btnSubject => btnSubject.next(),
  },
  {
  },
)(TestPage);