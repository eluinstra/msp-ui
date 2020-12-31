import { stat } from "fs";
import React, { useEffect, useState } from "react"
import { fromEvent } from 'rxjs'
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators'
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
const pointToList = v => [v.lat, v.lng]

const pointList = []

const rl = readline.createInterface({
  input: fs.createReadStream('/home/user/test.txt')
})

const sub = fromEvent(rl, 'line')
.pipe(
  takeUntil(fromEvent(rl, 'close')),
  filter(isValid),
  map(lineToPoint),
  distinctUntilChanged(comparePoints),
  map(pointToList)
)
.subscribe(
  v => pointList.push(v),
  err => console.log("Error: %s", err),
  () => console.log(pointList)
)

const MyPolyline = () => {
  const map = useMap()
  useEffect(() => {
    const polyline = L.polyline(
      pointList,
      {
          color: 'blue',
          weight: 3,
          opacity: .7,
          lineJoin: 'round'
      }
    )
    polyline.addTo(map);
    map.fitBounds(polyline.getBounds())
    return () => sub.unsubscribe()
  }, [])
  return <></>
}

export const Map = () => {
  const [state, setState] = useState({
    currentLocation: { lat: 53.21917, lng: 6.56667 },
    zoom: 12,
    latlngs: pointList
  })
  return (
    <MapContainer center={state.currentLocation} zoom={state.zoom} style={{ width: '100%', height: '600px'}}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      />
      <MyPolyline />
      {/* <Polyline positions={state.latlngs} color={'red'} /> */}
    </MapContainer>
  )
}