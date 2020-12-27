import { useObservableBehaviour, useObservableEvent } from '@/common/RxTools'
import { Button } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { Subject } from 'rxjs'
import { map, mapTo, scan } from 'rxjs/operators'

export const TestPage = () => {
  const [ count, setCount ] = useState(0)
  const [ btnClick, btnSubject ] = useObservableEvent()

  useEffect(() => {
    const sub = btnSubject
    .pipe(
      mapTo(count + 1)
    )
    .subscribe(v => {
      console.log(`Clicked ${v} times`)
      setCount(v)
    });
    return () => sub.unsubscribe()
  }, [btnSubject]);
return (
    <React.Fragment>
      <Button variant="contained" color="secondary" onClick={e => btnClick()}>Add</Button>
      {count}
    </React.Fragment>
  )
}