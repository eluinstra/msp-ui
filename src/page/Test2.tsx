import { useBehaviour, useObservableBehaviour, useObservableEvent } from '@/common/RxTools'
import { Button } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { Subject } from 'rxjs'
import { mapTo, scan } from 'rxjs/operators'

export const TestPage = () => {
  const [ count, setCount ] = useState(0)

return (
    <React.Fragment>
      <Button variant="contained" color="secondary" onClick={e => setCount(count + 1)}>Add</Button>
      {count}
    </React.Fragment>
  )
}