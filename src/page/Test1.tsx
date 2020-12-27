import { useObservableBehaviour, useObservableEvent } from '@/common/RxTools'
import { Button } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { Subject } from 'rxjs'
import { scan } from 'rxjs/operators'

const btnSubject = new Subject()

export const TestPage = () => {
  const [ count, setCount ] = useState(0)
  const [ btnClick ] = useObservableEvent(btnSubject)

  useEffect(() => {
    const sub = btnSubject
    .pipe(
      scan(c => c + 1, 0)
    )
    .subscribe(v => {
      console.log(`Clicked ${v} times`)
      setCount(v)
    });
    return () => sub.unsubscribe()
  }, []);
return (
    <React.Fragment>
      <Button variant="contained" color="secondary" onClick={e => btnClick()}>Add</Button>
      {count}
    </React.Fragment>
  )
}