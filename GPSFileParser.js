var _ = require('lodash')
var Rx = require('rxjs')
var { distinctUntilChanged, filter, map, takeUntil } = require('rxjs/operators')
var readline = require('readline')
var fs = require('fs')
const { parse } = require('path')

var rl = readline.createInterface({
  input: fs.createReadStream('/home/user/test.txt')
})

const isValid = l => !l.startsWith('nan')
const lineToPoint = l => {
  return {
    lat: Number(l.substring(0, 9)),
    lng: Number(l.substring(10, 18))
  }
}
const comparePoints = (p, c) => p.lat === c.lat && p.lng === c.lng
const pointToList = p => [p.lat, p.lng]

const point$ = Rx.fromEvent(rl, 'line')
  .pipe(
    takeUntil(Rx.fromEvent(rl, 'close')),
    filter(isValid),
    map(lineToPoint),
    distinctUntilChanged(comparePoints),
    map(pointToList)
  )
point$.subscribe(
  p => console.log(p),
  err => console.log("Error: %s", err),
  () => console.log("Complete"))
