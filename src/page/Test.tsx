import { useObservableBehaviour, useObservableEvent } from '@/common/RxTools'
import { Button } from '@material-ui/core'
import React, { useEffect } from 'react'
import { scan } from 'rxjs/operators'

export const TestPage = () => {
  const [ btnClick, btnSubject ] = useObservableEvent()
  const count = document.getElementById("count")
  useEffect(() => {
    const sub = btnSubject
    .pipe(
      scan(c => c + 1, 0)
    )
    .subscribe(v => {
      console.log(`Clicked ${v} times`)
      count.innerHTML = v.toString()
    });
    return () => sub.unsubscribe()
  }, [btnSubject]);
return (
    <React.Fragment>
      <Button variant="contained" color="secondary" onClick={e => btnClick()}>Add</Button>
      <div id="count"/>
    </React.Fragment>
  )
}