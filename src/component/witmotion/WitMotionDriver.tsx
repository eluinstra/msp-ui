{/****************************************************************************
 * src/components/witmotion/WitMotionDriver.tsx
 *
 *   Copyright (C) 2020-2021 Edwin Luinstra & Ben van der Veen. All rights reserved.
 *   Author:  Ben <disruptivesolutionsnl@gmail.com>
 *
 *   Based on: MspDriver
 *   Author:  Edwin Luinstra
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in
 *    the documentation and/or other materials provided with the
 *    distribution.
 * 3. Neither the name Bot4 nor the names of its contributors may be
 *    used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS
 * OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 ****************************************************************************/}

{/****************************************************************************
 * Included Files
 ****************************************************************************/}
import React, { Component } from "react";
import { useEffect, useState } from 'react'
import { BehaviorSubject, interval, fromEvent, Observable, Subject } from 'rxjs'
import { filter, share, tap } from 'rxjs/operators'
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { map, sample } from 'rxjs/operators'
import { props } from "rambda";
import { ImuState, ImuMsg, IWitmotionAccelerometer, IWitmotionAngularVelocity, IWitmotionAngle, IWitmotionMagnetic,
         imuTimeMs, imuAccelero, imuAngularVelocity, imuAngle, imuMagnetic } from '@/component/witmotion/WitMotionProtocol'
import { Button } from '@material-ui/core'
import Typography from "@material-ui/core/Typography";
import { ContentSort } from "material-ui/svg-icons";
import { lpushAsync, lrangeAsync, delAsync, flushallAsync, flushDBAsync } from '@/services/dbcapturing'
import SerialPort from "serialport";
import { getPort$, getPath, isOpen, registerFunction, write } from '@/component/serialport/SerialPortDriver'

{/****************************************************************************
 * Private Types
****************************************************************************/}

type Props = {
  serialPort1: any;
  serialPort2: any;
}

type State = {
  name: string
  //serialPort: any
}

let messageStarted = false
let datasegmentcounter = 0
let parseState = 0
let cmd = undefined

{/****************************************************************************
 * Private Function Prototypes
****************************************************************************/}

{/* Algorithms */ }

{/****************************************************************************
 * Private Data
****************************************************************************/}

{/* public interface - convention place on top */ }

const imuMsg: ImuMsg = {
  state: ImuState.IMU_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0
}

const iWitmotionAccelerometer: IWitmotionAccelerometer = {
  enable: false,
  dscnt: 0,
  SBYTE: 0,
  CMD: 0,
  AxL: 0,
  AxH: 0,
  AyL: 0,
  AyH: 0,
  AzL: 0,
  AzH: 0,
  TL: 0,
  TH: 0,
  SUM: 0
}

const iWitmotionAngularVelocity: IWitmotionAngularVelocity = {
  enable: false,
  dscnt: 0,
  SBYTE: 0,
  CMD: 0,
  wxL: 0,
  wxH: 0,
  wyL: 0,
  wyH: 0,
  wzL: 0,
  wzH: 0,
  TL: 0,
  TH: 0,
  SUM: 0
}

const iWitmotionAngle: IWitmotionAngle = {
  enable: false,
  dscnt: 0,
  SBYTE: 0,
  CMD: 0,
  RollL: 0,
  RollH: 0,
  PitchL: 0,
  PitchH: 0,
  YawL: 0,
  YawH: 0,
  TL: 0,
  TH: 0,
  SUM: 0
}

const iWitmotionMagnetic: IWitmotionMagnetic = {
  enable: false,
  dscnt: 0,
  SBYTE: 0,
  CMD: 0,
  HxL: 0,
  HxH: 0,
  HyL: 0,
  HyH: 0,
  HzL: 0,
  HzH: 0,
  TL: 0,
  TH: 0,
  SUM: 0
}

export enum SensorState {
  SENSOR_IDLE,
  SENSOR_COLLECTING,
  SENSOR_ENDED_COLLECTING,
  SENSOR_FLUSHING,
  SENSOR_ERROR_RECEIVED
}
export interface SensorMsg {
  state: SensorState,
  flag: number,
  cmd: number,
  length: number,
  buffer: number[],
  checksum: number,
  collecting: boolean
}
export interface SensorDriver {
  serialPort: BehaviorSubject<any>,
  sensorMsg: SensorMsg,
  sensorResponse$: Subject<SensorMsg>
}

{/****************************************************************************
 * Private Functions
****************************************************************************/}

{/****************************************************************************
 * Name: parseIncommingString
 *
 * Description:
 *   A parser vor the hex values comming from the Serialport.
 *
 * Input Parameters:
 *   num : number - Hex values in Readint8() format.
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}

function parseIncommingString(num: number) {

  switch (parseState) {
    case 0:
      if (num == ImuState.IMU_PREFIX)
        imuMsg.state = ImuState.IMU_IDLE;
      parseState = 1
      break;
    case 1:
      if ([ImuState.IMU_TIME, ImuState.IMU_ACCELERO, ImuState.IMU_ANGLE, ImuState.IMU_ANGULARVELOCITY, ImuState.IMU_MAGNETIC].includes(num)) {
        cmd = num
        parseState = 2
        datasegmentcounter = 0
      }
      else
        parseState = 0
      break;
    case 2:
      //lpushAsync('berichten', datasegmentcounter+" } [ " + saxH + " " + saxL + " " + sayH + " -- " + T + " ]");

      datasegmentcounter++;

      if (cmd == ImuState.IMU_ACCELERO) {
        iWitmotionAccelerometer.dscnt = datasegmentcounter;
        iWitmotionAccelerometer.SBYTE = 85;
        iWitmotionAccelerometer.CMD = cmd;
        switch (datasegmentcounter) {
          case 1: iWitmotionAccelerometer.AxL = num; break;
          case 2: iWitmotionAccelerometer.AxH = num; break;
          case 3: iWitmotionAccelerometer.AyL = num; break;
          case 4: iWitmotionAccelerometer.AyH = num; break;
          case 5: iWitmotionAccelerometer.AzL = num; break;
          case 6: iWitmotionAccelerometer.AzH = num; break;
          case 7: iWitmotionAccelerometer.TL = num; break;
          case 8: iWitmotionAccelerometer.TH = num; break;
          case 9: iWitmotionAccelerometer.SUM = num; break;
        }
        if (datasegmentcounter == 9) {
          imuMsg.state = ImuState.IMU_ACCELERO_RECEIVED;
        }
      }

      if (cmd == ImuState.IMU_ANGULARVELOCITY) {
        iWitmotionAngularVelocity.dscnt = datasegmentcounter;
        iWitmotionAngularVelocity.SBYTE = 85;
        iWitmotionAngularVelocity.CMD = cmd;
        switch (datasegmentcounter) {
          case 1: iWitmotionAngularVelocity.wxL = num; break;
          case 2: iWitmotionAngularVelocity.wxH = num; break;
          case 3: iWitmotionAngularVelocity.wyL = num; break;
          case 4: iWitmotionAngularVelocity.wyH = num; break;
          case 5: iWitmotionAngularVelocity.wzL = num; break;
          case 6: iWitmotionAngularVelocity.wzH = num; break;
          case 7: iWitmotionAngularVelocity.TL = num; break;
          case 8: iWitmotionAngularVelocity.TH = num; break;
          case 9: iWitmotionAngularVelocity.SUM = num; break;
        }
        if (datasegmentcounter == 9) {
          imuMsg.state = ImuState.IMU_ANGULARVELOCITY_RECEIVED;
        }
      }

      if (cmd == ImuState.IMU_ANGLE) {
        iWitmotionAngle.dscnt = datasegmentcounter;
        iWitmotionAngle.SBYTE = 85;
        iWitmotionAngle.CMD = cmd;
        switch (datasegmentcounter) {
          case 1: iWitmotionAngle.RollL = num; break;
          case 2: iWitmotionAngle.RollH = num; break;
          case 3: iWitmotionAngle.PitchL = num; break;
          case 4: iWitmotionAngle.PitchH = num; break;
          case 5: iWitmotionAngle.YawL = num; break;
          case 6: iWitmotionAngle.YawH = num; break;
          case 7: iWitmotionAngle.TL = num; break;
          case 8: iWitmotionAngle.TH = num; break;
          case 9: iWitmotionAngle.SUM = num; break;
        }
        if (datasegmentcounter == 9) {
          imuMsg.state = ImuState.IMU_ANGLE_RECEIVED;
        }
      }

      if (cmd == ImuState.IMU_MAGNETIC) {
        iWitmotionMagnetic.dscnt = datasegmentcounter;
        iWitmotionMagnetic.SBYTE = 85;
        iWitmotionMagnetic.CMD = cmd;
        switch (datasegmentcounter) {
          case 1: iWitmotionMagnetic.HxL = num; break;
          case 2: iWitmotionMagnetic.HxH = num; break;
          case 3: iWitmotionMagnetic.HyL = num; break;
          case 4: iWitmotionMagnetic.HyH = num; break;
          case 5: iWitmotionMagnetic.HzL = num; break;
          case 6: iWitmotionMagnetic.HzH = num; break;
          case 7: iWitmotionMagnetic.TL = num; break;
          case 8: iWitmotionMagnetic.TH = num; break;
          case 9: iWitmotionMagnetic.SUM = num; break;
        }
        if (datasegmentcounter == 9) {
          imuMsg.state = ImuState.IMU_MAGNETIC_RECEIVED;
        }
      }

      if (datasegmentcounter == 9) {
        parseState = 0
        datasegmentcounter = 0
        cmd = 0
        num = 0
      }
      break;

  }
}

{/****************************************************************************
 * Public Functions
 *
 * We have to implement it in a form that the driver can be used with 
 * multiple other serial drivers. And the trigger is not comming from
 * serial stream and data, but from the : "front-end"
****************************************************************************/}

{/****************************************************************************
 * Name: getSensorResponse$
 *
 * Description:
 *   Observable from RxJS.
 *
 * Input Parameters:
 *   driver - The driver object is given to the Observable
 *
 * Returned Value:
 *   The Subject from the Observable.
 *
****************************************************************************/}
export const getSensorResponse$ = (driver: SensorDriver) => driver.sensorResponse$

{/****************************************************************************
 * Name: createSensorResponse$
 *
 * Description:
 *   New Observable Subject from RxJS.
 *
 * Input Parameters:
 *   None
 *
 * Returned Value:
 *   The Subject from the Observable.
 *
****************************************************************************/}
const createSensorResponse$ = () => new Subject<SensorMsg>()

{/****************************************************************************
 * Name: getPortName$
 *
 * Description:
 *   Gets the pathname from the serialport.
 *
 * Input Parameters:
 *   driver - The driver object
 *
 * Returned Value:
 *   The path from a serialport.
 *
****************************************************************************/}
export const getPortName = (driver: SensorDriver) => getPath(driver.serialPort)

{/****************************************************************************
 * Name: sensorRequest$
 *
 * Description:
 *   A sensor request enrtypoint for the frontend.
 *
 * Input Parameters:
 *   driver - The driver object is given to the Observable
 *   cmd - The command in a enumaration format as validation
 *   payload: A string given in what the function is which is used
 *
 * Returned Value:
 *   A response to the Observable Subject (sensorResponse$.next)
 *
****************************************************************************/}
export const sensorRequest = (driver: SensorDriver, cmd: SensorState, payload: string) => {

  const { serialPort, sensorMsg, sensorResponse$ } = driver

  parseSensorCommand(driver, cmd)

  if (cmd == SensorState.SENSOR_COLLECTING) {
    sensorResponse$.next({ ...driver.sensorMsg })
    driver.sensorMsg.state = SensorState.SENSOR_IDLE
  } else if (cmd == SensorState.SENSOR_ENDED_COLLECTING) {
    sensorResponse$.next({ ...driver.sensorMsg })
    driver.sensorMsg.state = SensorState.SENSOR_IDLE
  } else if (cmd == SensorState.SENSOR_ERROR_RECEIVED) {
    sensorResponse$.error(new Error('MSP error received!'))
    sensorResponse$.next({ ...driver.sensorMsg })
    console.log('Sensor error received!\n');
    driver.sensorMsg.state = SensorState.SENSOR_IDLE
  }

}

{/****************************************************************************
 * Name: createSensorDriver
 *
 * Description:
 *   The initialization of the sensor driver and making the object driver.
 *
 * Input Parameters:
 *   serialPort - The serialport which the driver/parsers is/are connected to
 *
 * Returned Value:
 *   A response subject is created (Observable)
 *
****************************************************************************/}
export const createSensorDriver = (serialPort: BehaviorSubject<any>): SensorDriver => {
  return {
    serialPort: serialPort,
    sensorMsg: {
      state: SensorState.SENSOR_IDLE,
      flag: 0,
      cmd: 0,
      length: 0,
      buffer: [],
      checksum: 0,
      collecting: false
    },
    sensorResponse$: createSensorResponse$()
  }
}

{/****************************************************************************
 * Name: parseSensorCommand
 *
 * Description:
 *   A parser for the command comming from the frontend dialog.
 *
 * Input Parameters:
 *   driver - The driver object is given from (passthrough) from the frontend.
 *   cmd - The state given from the frontend
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
const parseSensorCommand = (driver: SensorDriver, cmd: SensorState) => {
  const { serialPort, sensorMsg, sensorResponse$ } = driver

  switch (cmd) {
    case SensorState.SENSOR_COLLECTING:
      sensorMsg.collecting = true;
      startAndStopCapturing(driver, cmd);
      break;
    case SensorState.SENSOR_ENDED_COLLECTING:
      sensorMsg.collecting = false;
      startAndStopCapturing(driver, cmd);
      break;
    case SensorState.SENSOR_FLUSHING:
      sensorMsg.collecting = false;
      flushRedisData(driver, cmd)
      break;
  }
}

{/****************************************************************************
 * Name: stopSensorDriver
 *
 * Description:
 *   Stops the serialport driver when one determines to close the serialport.
 *
 * Input Parameters:
 *   driver - The driver object is given from (passthrough) from the frontend.
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
const stopSensorDriver = (driver: SensorDriver) => registerFunction(driver.serialPort, function (data) { })

{/****************************************************************************
 * Name: flushRedisData
 *
 * Description:
 *   It also "deletes" the Redis Keys.
 *   It also "sets" the origin name obtained from the driver Path.
 * 
 *   We could use flushAllAsync. But we wanted to keep control for now.
 *
 * Input Parameters:
 *   driver - The driver object is given from (passthrough) from the frontend.
 *   cmd - One gives the SensorState
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
function flushRedisData(driver: SensorDriver, cmd: SensorState) {

  const { serialPort, sensorMsg, sensorResponse$ } = driver

  var originName = "" + getPath(serialPort);
  
  delAsync(originName + '_Accelero_X', 0);
  delAsync(originName + '_Accelero_Y', 0);
  delAsync(originName + '_Accelero_Z', 0);

  delAsync(originName + '_AngularVelocity_X', 0);
  delAsync(originName + '_AngularVelocity_Y', 0);
  delAsync(originName + '_AngularVelocity_Z', 0);

  delAsync(originName + '_Angle_X', 0)
  delAsync(originName + '_Angle_Y', 0)
  delAsync(originName + '_Angle_Z', 0)

  delAsync(originName + '_Magnetic_X', 0)
  delAsync(originName + '_Magnetic_Y', 0)
  delAsync(originName + '_Magnetic_Z', 0)

  flushallAsync();

}

{/****************************************************************************
 * Name: startAndStopCapturing
 *
 * Description:
 *   In this function the real capturing takes place and storage from the data
 *   in Redis. Also you can stop the process without shutting down the serial
 *   connections.
 *
 * Input Parameters:
 *   driver - The driver object is given from (passthrough) from the frontend.
 *   cmd - One gives the SensorState
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
function startAndStopCapturing(driver: SensorDriver, cmd: SensorState) {

  const { serialPort, sensorMsg, sensorResponse$ } = driver

  /* start capturing */
  driver.serialPort?.value.on('data', function (data) {
    if (sensorMsg.collecting) {

      for (let i = 0; i < data.length; i++) {
        //if 0x55 is found unpack messages till next 0x55

        parseIncommingString(data.readInt8(i))

        let resolutie = 1;

        let timestamp = new Date().getTime();

        /* Redis calls */

        var originName = "" + getPath(serialPort);

        if (imuMsg.state == ImuState.IMU_ACCELERO_RECEIVED) {

          //imuResponse$.next(imuMsgAngle) --> This was to place it back in the Subject for the chart

          let T = ((iWitmotionAccelerometer.TH << 8) | iWitmotionAccelerometer.TL & 0xFF) / 100;

          lpushAsync('dataTemp', "ts:" + new Date().getTime() + "^Tx:" + T);

          /* @TODO: Function toevoegen [Clean code] Function insert in Database{object) Function Accelero */

          let yx = imuAccelero(iWitmotionAccelerometer.AxH, iWitmotionAccelerometer.AxL);
          let yy = imuAccelero(iWitmotionAccelerometer.AyH, iWitmotionAccelerometer.AyL);
          let yz = imuAccelero(iWitmotionAccelerometer.AzH, iWitmotionAccelerometer.AzL);

          //let hVal = (iWitmotionAccelerometer.AxH >127) ? (iWitmotionAccelerometer.AxH-256) : iWitmotionAccelerometer.AxH; //0x7F en 0x100
          //let lVal = (iWitmotionAccelerometer.AxL & 0xFF);
          //let xAlg = (((hVal << 8) | lVal) / 32768) * 16;

          //let xAlgoud = ((iWitmotionAccelerometer.AxH << 8) | iWitmotionAccelerometer.AxL) / 32768 * 16;

          let chk = (iWitmotionAccelerometer.SBYTE + iWitmotionAccelerometer.CMD +
            iWitmotionAccelerometer.AxH + iWitmotionAccelerometer.AxL +
            iWitmotionAccelerometer.AyH + iWitmotionAccelerometer.AyL +
            iWitmotionAccelerometer.AzH + iWitmotionAccelerometer.AzL +
            iWitmotionAccelerometer.TH + iWitmotionAccelerometer.TL);

          //let sum = (iWitmotionAccelerometer.SUM > 127) ? (iWitmotionAccelerometer.SUM-256) :iWitmotionAccelerometer.SUM;
          let sum = (iWitmotionAccelerometer.SUM & 0xFF);

          if (chk == sum)
          {
            lpushAsync(originName + '_Accelero_X', "ts:" + timestamp + "^x:" + timestamp + "^y:" + yx);
            lpushAsync(originName + '_Accelero_Y', "ts:" + timestamp + "^x:" + timestamp + "^y:" + yy);
            lpushAsync(originName + '_Accelero_Z', "ts:" + timestamp + "^x:" + timestamp + "^y:" + yz);
          }
          else
          {
            lpushAsync(originName + '_Accelero_ERROR', "chk:" + chk + "^sum:" + sum)
          }

          

          imuMsg.state = ImuState.IMU_IDLE;
        }
        else if (imuMsg.state == ImuState.IMU_ANGULARVELOCITY_RECEIVED) {
          let avyx = imuAngularVelocity(iWitmotionAngularVelocity.wxH, iWitmotionAngularVelocity.wxL);
          let avyy = imuAngularVelocity(iWitmotionAngularVelocity.wyH, iWitmotionAngularVelocity.wyL);
          let avyz = imuAngularVelocity(iWitmotionAngularVelocity.wzH, iWitmotionAngularVelocity.wzL);
          
          let chk = (iWitmotionAngularVelocity.SBYTE + iWitmotionAngularVelocity.CMD +
            iWitmotionAngularVelocity.wxH + iWitmotionAngularVelocity.wxL +
            iWitmotionAngularVelocity.wyH + iWitmotionAngularVelocity.wyL +
            iWitmotionAngularVelocity.wzH + iWitmotionAngularVelocity.wzL +
            iWitmotionAngularVelocity.TH + iWitmotionAngularVelocity.TL);

          //let sum = (iWitmotionAngularVelocity.SUM > 127) ? (iWitmotionAngularVelocity.SUM-256) :iWitmotionAngularVelocity.SUM;
          let sum = (iWitmotionAngularVelocity.SUM & 0xFF);

          if (chk == sum)
          {

            lpushAsync(originName + '_AngularVelocity_X', "ts:" + timestamp + "^x:" + timestamp + "^y:" + avyx)
            lpushAsync(originName + '_AngularVelocity_Y', "ts:" + timestamp + "^x:" + timestamp + "^y:" + avyy)
            lpushAsync(originName + '_AngularVelocity_Z', "ts:" + timestamp + "^x:" + timestamp + "^y:" + avyz)
          }
          else
          {
            lpushAsync(originName + '_AngularVelocity_ERROR', "chk:" + chk + "^sum:" + sum)
          }

          imuMsg.state = ImuState.IMU_IDLE
        }
        else if (imuMsg.state == ImuState.IMU_ANGLE_RECEIVED) {
          let anyx = imuAngle(iWitmotionAngle.RollH, iWitmotionAngle.RollL);
          let anyy = imuAngle(iWitmotionAngle.PitchH, iWitmotionAngle.PitchL);
          let anyz = imuAngle(iWitmotionAngle.YawH, iWitmotionAngle.YawL);

          let chk = (iWitmotionAngle.SBYTE + iWitmotionAngle.CMD +
            iWitmotionAngle.RollH + iWitmotionAngle.RollL +
            iWitmotionAngle.PitchH + iWitmotionAngle.PitchL +
            iWitmotionAngle.YawH + iWitmotionAngle.YawL +
            iWitmotionAngle.TH + iWitmotionAngle.TL);

          //let sum = (iWitmotionAngle.SUM > 127) ? (iWitmotionAngle.SUM-256) :iWitmotionAngle.SUM;
          let sum = (iWitmotionAngle.SUM & 0xFF);

          if (chk == sum)
          {
            lpushAsync(originName + '_Angle_X', "ts:" + timestamp + "^x:" + timestamp + "^y:" + anyx)
            lpushAsync(originName + '_Angle_Y', "ts:" + timestamp + "^x:" + timestamp + "^y:" + anyy)
            lpushAsync(originName + '_Angle_Z', "ts:" + timestamp + "^x:" + timestamp + "^y:" + anyz)
          }
          else
          {
            lpushAsync(originName + '_Angle_ERROR', "chk:" + chk + "^sum:" + sum)
          }

          imuMsg.state = ImuState.IMU_IDLE
        }
        else if (imuMsg.state == ImuState.IMU_MAGNETIC_RECEIVED) {
          let mgyx = imuMagnetic(iWitmotionMagnetic.HxH, iWitmotionMagnetic.HxL);
          let mgyy = imuMagnetic(iWitmotionMagnetic.HyH, iWitmotionMagnetic.HyL);
          let mgyz = imuMagnetic(iWitmotionMagnetic.HzH, iWitmotionMagnetic.HzL);

          let chk = (iWitmotionMagnetic.SBYTE + iWitmotionMagnetic.CMD +
            iWitmotionMagnetic.HxH + iWitmotionMagnetic.HxL +
            iWitmotionMagnetic.HyH + iWitmotionMagnetic.HyL +
            iWitmotionMagnetic.HzH + iWitmotionMagnetic.HzL +
            iWitmotionMagnetic.TH + iWitmotionMagnetic.TL);

          //let sum = (iWitmotionMagnetic.SUM > 127) ? (iWitmotionMagnetic.SUM-256) :iWitmotionMagnetic.SUM;
          let sum = (iWitmotionMagnetic.SUM & 0xFF);

          if (chk == sum)
          {
            lpushAsync(originName + '_Magnetic_X', "ts:" + timestamp + "^x:" + timestamp + "^y:" + mgyx)
            lpushAsync(originName + '_Magnetic_Y', "ts:" + timestamp + "^x:" + timestamp + "^y:" + mgyy)
            lpushAsync(originName + '_Magnetic_Z', "ts:" + timestamp + "^x:" + timestamp + "^y:" + mgyz)
          }
          else
          {
            lpushAsync(originName + '_Magnetic_ERROR', "chk:" + chk + "^sum:" + sum)
          }

          imuMsg.state = ImuState.IMU_IDLE
        } else if (imuMsg.state == ImuState.IMU_ERROR_RECEIVED) {
          //imuResponse$.error(new Error('MSP error received!'))
          imuMsg.state = ImuState.IMU_IDLE
        }
      }
    }
  })
}


