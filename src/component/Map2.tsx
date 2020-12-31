import { stat } from "fs";
import React, { useEffect, useState } from "react"
import { fromEvent } from 'rxjs'
import { delay, distinctUntilChanged, filter, map, startWith, takeUntil, tap } from 'rxjs/operators'
import { useStatefulObservable, useObservableBehaviour, useObservableEvent, useBehaviour } from '@/common/RxTools'
import L, { LatLngExpression, LatLngTuple, Polyline as LeafletPolyline, PolylineOptions } from 'leaflet'
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'
import readline from 'readline'
import fs from'fs'

const isValid = v => !v.startsWith('nan')
const lineToPoint = v => {
  return {
    lat: Number(v.substring(0, 9)),
    lng: Number(v.substring(10, 18))
  }
}
const comparePoints = (p, n) => p.lat === n.lat && p.lng === n.lng
const pointToLatLng = v => [v.lat, v.lng] as LatLngTuple

const pointList: LatLngTuple[] = []

const rl = readline.createInterface({
  input: fs.createReadStream('/home/user/test.txt')
})

const point$ = fromEvent(rl, 'line')
.pipe(
  //delay(500),
  takeUntil(fromEvent(rl, 'close')),
  filter(isValid),
  map(lineToPoint),
  distinctUntilChanged(comparePoints),
  map(pointToLatLng),
  tap(console.log)
)
.subscribe(
  v => pointList.push(v),
  err => console.log("Error: %s", err),
  () => console.log(pointList)
)

export const Map = () => {
  const [state, setState] = useState({
    currentLocation: { lat: 53.21917, lng: 6.56667 },
    zoom: 12
  })
  useEffect(() => {
    const map = L.map(document.getElementById('map')).setView(state.currentLocation, state.zoom);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
    }).addTo(map);
    const line = L.polyline(pointList,{
      color: 'red',
      weight: 3,
      opacity: .7,
      lineJoin: 'round'
    }).addTo(map);
    // const sub = point$.subscribe(v => {
    //   console.log(v)
    //   line.addLatLng(v)
    //   map.fitBounds(line.getBounds())
    // })
    // return () => sub.unsubscribe()
    //line.addLatLng(pointList)
    map.fitBounds(line.getBounds())
  })
  return (
    <div id="map" style={{ width: '100%', height: '600px'}}></div>
  )
}