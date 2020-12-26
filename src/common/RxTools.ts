import { useState, useEffect } from 'react'
import { Observable, Subject } from 'rxjs';

export function useStatefulObservable<T>(observable: Observable<T>): T {
  const [state, setState] = useState<T>()
  useEffect(() => {
    const sub = observable.subscribe(setState)
    return () => sub.unsubscribe()
  }, [observable])
  return state
}

export function useBehaviour<T>(props: T): [T, (v: Partial<T>) => void] {
  const [state, setState] = useState<T>(props)
  const changeState = (v: Partial<T>) => setState({ ...state, ...v })
  return [state, changeState]
}

export function useObservableBehaviour<T>(subject: Subject<T> = new Subject<T>()): [T, (v: Partial<T>) => void, Subject<T>] {
  const state = useStatefulObservable(subject)
  const changeState = (v: Partial<T>) => subject.next({ ...state, ...v })
  return [state, changeState, subject]
}

export function useObservableEvent(subject: Subject<any> = new Subject()): [() => void, Subject<any>] {
  const next = () => subject.next()
  return [next, subject]
}