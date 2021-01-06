import _ from 'lodash'
import { stat } from "fs"
import React, { useEffect, useState } from "react"
import { fromEvent } from 'rxjs'
import { delay, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators'
import L, { LatLngExpression, LatLngTuple, Polyline as LeafletPolyline, Polyline, PolylineOptions } from 'leaflet'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import readline from 'readline'
import fs from'fs'

const isValid = (s: string) => !s.startsWith('nan')
const lineToPointParser = (re: RegExp, s: string) => {
  const m = s.match(re)
  return {
    lat: Number(m[1]),
    lng: Number(m[2])
  }
}
const lineToPoint = (s: string) => lineToPointParser(/^(\d*\.\d*)\^(\d*.\d*)|/, s)
const comparePoints = (p, n) => p.lat === n.lat && p.lng === n.lng
const pointToLatLng = v => [v.lat, v.lng]

const MyPolyline = props => {
  const rl = readline.createInterface({
    input: fs.createReadStream(props.line.filename)
  })
  const [ point$ ] = useState(fromEvent(rl, 'line')
    .pipe(
      takeUntil(fromEvent(rl, 'close')),
      filter(isValid),
      map(lineToPoint),
      distinctUntilChanged(comparePoints),
      map(pointToLatLng))
  )
  const gMap = useMap()
  const polyline: Polyline = props.line.polyline.addTo(gMap)
  point$.subscribe(
    p => {
      polyline.addLatLng(p)
      gMap.fitBounds(polyline.getBounds())
    },
    err => console.log("Error: %s", err),
    () => {
      gMap.fitBounds(polyline.getBounds())
      console.log("Complete")
    }
  )
  return <></>
}

export const Map = () => {
  const [state, setState] = useState({
    currentLocation: { lat: 53.21917, lng: 6.56667 },
    zoom: 12,
    lines: [{
      filename: 'D:/data/test.txt',
      polyline: L.polyline([], {
            color: 'blue',
            weight: 3,
            opacity: .7,
            lineJoin: 'round'
        }
      )
    },{
      filename: 'D:/data/test.txt',
      polyline: L.polyline([], {
            color: 'red',
            weight: 1,
            opacity: .7,
            lineJoin: 'round'
        }
      )
    }]
  })
  return (
    <MapContainer center={state.currentLocation} zoom={state.zoom} style={{ width: '100%', height: '600px'}}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      />
      <MyPolyline line={state.lines[0]} />
      <MyPolyline line={state.lines[1]} />
      {/* {_.forEach(state.lines, line => {
         <MyPolyline line={line} />
      })} */}
    </MapContainer>
  )
}