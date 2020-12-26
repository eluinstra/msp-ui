import { useState, useEffect } from 'react'
import { Observable, Subject } from 'rxjs';

export function useStatefulObservable<T>(observable: Observable<T>): T {
  const [state, setState] = useState<T>();
  useEffect(() => {
    const sub = observable.subscribe(setState);
    return () => sub.unsubscribe();
  }, [observable]);
  return state;
};

export function useStatefulSubject<T>(subject: Subject<T> = new Subject<T>()): [T, (v: T) => void, Subject<T>] {
  const onChange = (v: T) => subject.next(v)
  const observable = useStatefulObservable(subject)
  return [observable, onChange, subject];
};

export function useSubject(subject: Subject<any> = new Subject()): [() => void, Subject<any>] {
  const onNext = () => subject.next()
  return [onNext, subject]
}