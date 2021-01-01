var _ = require('lodash')
var Rx = require('rxjs')
var { distinctUntilChanged, filter, map, takeUntil } = require('rxjs/operators')
var readline = require('readline')
var fs = require('fs')
const { parse } = require('path')

var rl = readline.createInterface({
  input: fs.createReadStream('/home/user/test.txt')
})

const isValidPoint = p => !(isNaN(p.lat) || isNaN(p.lng))
const lineToPoint = l => {
  const m = l.match(/^(\d*\.\d*)\^(\d*.\d*)|/)
  return {
    lat: Number(m[1]),
    lng: Number(m[2])
  }
}
const comparePoints = (p, c) => p.lat === c.lat && p.lng === c.lng
const pointToList = p => [p.lat, p.lng]

const point$ = Rx.fromEvent(rl, 'line')
  .pipe(
    takeUntil(Rx.fromEvent(rl, 'close')),
    map(lineToPoint),
    filter(isValidPoint),
    distinctUntilChanged(comparePoints),
    map(pointToList)
  )
point$.subscribe(
  p => console.log(p),
  err => console.log("Error: %s", err),
  () => console.log("Complete"))
