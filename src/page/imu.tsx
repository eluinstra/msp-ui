import React from 'react'
import { useEffect, useState } from 'react'
import { ImuInput } from '@/component/imu/imu-input'
import { Line } from 'react-chartjs-2';
import { from, fromEvent, Observable, Subject } from 'rxjs'
import CChart from "./ichart";

export const IMU = () => {
  // const [data, setData] = useBehaviour(genData())

  // useEffect(() => {
  //   const interval = setInterval(() => setData(genData()), 500)

  //   return () => clearInterval(interval)
  // }, [])
  return (
    <React.Fragment>
      <h2>IMU</h2>
      <ImuInput />
      <CChart />
    </React.Fragment>
  )
}
