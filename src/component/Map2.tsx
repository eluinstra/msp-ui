import { stat } from "fs"
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

export const Map = () => {
  const [state, setState] = useState({
    currentLocation: { lat: 53.21917, lng: 6.56667 },
    zoom: 12
  })
  const rl = readline.createInterface({
    input: fs.createReadStream('/home/user/test.txt')
  })
  const [ point$ ] = useState(fromEvent(rl, 'line')
    .pipe(
      //delay(500),
      takeUntil(fromEvent(rl, 'close')),
      filter(isValid),
      map(lineToPoint),
      distinctUntilChanged(comparePoints),
      map(pointToLatLng),
  ))
  useEffect(() => {
    const gMap = L.map(document.getElementById('map')).setView(state.currentLocation, state.zoom)
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
    }).addTo(gMap)
    const line = L.polyline([],{
      color: 'red',
      weight: 3,
      opacity: .7,
      lineJoin: 'round'
    }).addTo(gMap)
    point$.subscribe(
      p => {
        line.addLatLng(p)
        // gMap.fitBounds(polyline.getBounds())
      },
      err => console.log("Error: %s", err),
      () => {
        gMap.fitBounds(line.getBounds())
        console.log("Complete")
      }
    )
  })
  return (
    <div id="map" style={{ width: '100%', height: '600px'}}></div>
  )
}