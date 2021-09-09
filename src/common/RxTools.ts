import { useEffect, useState } from 'react';
import { Observable, Subject } from 'rxjs';

export function useStatefulObservable<T>(observable: Observable<T>, initState?: T): T {
  const [state, setState] = initState == undefined ? useState<T>() : useState(initState)
  useEffect(() => {
    const sub = observable.subscribe(setState)
    return () => sub.unsubscribe()
  }, [observable])
  return state
}

export function useObservableState<T>(observable: Subject<T> = new Subject<T>()): [T, (v: T) => void, Observable<T>] {
  const state = useStatefulObservable(observable)
  const setState = (v: T) => observable.next(v)
  return [state, setState, observable]
}

export function useObservableEvent(observable: Subject<any> = new Subject()): [() => void, Observable<any>] {
  const next = () => observable.next()
  return [next, observable]
}

export function useBehaviour<T>(props: T): [T, (v: Partial<T>) => void] {
  const [state, setState] = useState<T>(props)
  const changeState = (v: Partial<T>) => setState({ ...state, ...v })
  return [state, changeState]
}

export function useObservableBehaviour<T>(observable: Subject<T> = new Subject<T>()): [T, (v: Partial<T>) => void, Observable<T>] {
  const state = useStatefulObservable(observable)
  const changeState = (v: Partial<T>) => observable.next({ ...state, ...v })
  return [state, changeState, observable]
}

export function useObservableBehaviourOf<T>(initState: T, observable: Subject<T> = new Subject<T>()): [T, (v: Partial<T>) => void, Observable<T>] {
  const state = useStatefulObservable(observable, initState)
  const changeState = (v: Partial<T>) => observable.next({ ...state, ...v })
  return [state, changeState, observable]
}
