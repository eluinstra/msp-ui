import React, { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import 'chartjs-plugin-streaming'
import { interval } from "rxjs"
import { filter, map, startWith, tap } from "rxjs/operators"
import { sample } from "rxjs/operators"
import { imuResponse$, registerPort, unregisterPort } from '@/component/imu/WitMotion/Driver'
import { isOpen } from "@/component/serialport/SerialPortDriver"
import ReactApexChart from 'react-apexcharts'
import ApexCharts from 'apexcharts'
import sound from 'sound-play'

const path = require("path");
const filePath = path.join("D:\\msp-ui\\assets\\sounds", "missed.mp3")
let volume = 0.5


export const AudioPlayExample = props => {
  const { serialPort } = props
  //const [data, updateData] = useState([1, 2, 3, 4, 5, 6]);

  
  useEffect(() => {
    console.log(""+__dirname +": "+filePath);
    sound.play(filePath, volume);
    
    

  }, [])
  return (
    <div/>
  )
}
