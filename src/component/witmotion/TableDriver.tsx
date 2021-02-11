{/****************************************************************************
 * src/components/witmotion/TableDriver.tsx
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
import { lpushAsync, lrangeAsync } from '@/services/dbcapturing'
import SerialPort from "serialport";
import { getPort$, getPath, isOpen, registerFunction, write } from '@/component/serialport/SerialPortDriver'

{/****************************************************************************
 * Private Types
****************************************************************************/}

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

export enum TableActionState {
  STATISTICS_IDLE,
  STATISTICS_COLLECTING,
  STATISTICS_ENDED_COLLECTING,
  STATISTICS_FLUSHING,
  STATISTICS_ERROR_RECEIVED
}

const statisticsMsg: TableActionMsg = {
  path: '',
  state: TableActionState.STATISTICS_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0,
  collecting: false
}

export interface TableActionMsg {
  path: string,
  state: TableActionState,
  flag: number,
  cmd: number,
  length: number,
  buffer: number[],
  checksum: number,
  collecting: boolean
}
export interface TableDriver {
  statisticsMsg: TableActionMsg,
  statisticsResponse$: Subject<TableActionMsg>
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
      if (num == TableActionState.STATISTICS_IDLE)
        statisticsMsg.state = TableActionState.STATISTICS_IDLE;
      parseState = 1
      break;
    case 1:
      if ([TableActionState.STATISTICS_COLLECTING].includes(num)) {
        cmd = num
        parseState = 2
        datasegmentcounter = 0
      }
      else
        parseState = 0
      break;
    case 2:
      
      datasegmentcounter++;

      if (cmd == TableActionState.STATISTICS_COLLECTING) {
   
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
 * Name: getStatisticsResponse$
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
export const getStatisticsResponse$ = (driver: TableDriver) => driver.statisticsResponse$

{/****************************************************************************
 * Name: createStatisticsResponse$
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
const createStatisticsResponse$ = () => new Subject<TableActionMsg>()

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
export const statisticsRequest = (driver: TableDriver, cmd: TableActionState, payload: string) => {

  const { statisticsMsg, statisticsResponse$ } = driver

  parseTableCommand(driver, cmd)

  if (cmd == TableActionState.STATISTICS_COLLECTING) {
    statisticsResponse$.next({ ...driver.statisticsMsg })
    driver.statisticsMsg.state = TableActionState.STATISTICS_IDLE
  } else if (cmd == TableActionState.STATISTICS_ENDED_COLLECTING) {
    statisticsResponse$.next({ ...driver.statisticsMsg })
    driver.statisticsMsg.state = TableActionState.STATISTICS_IDLE
  } else if (cmd == TableActionState.STATISTICS_ERROR_RECEIVED) {
    statisticsResponse$.error(new Error('MSP error received!'))
    statisticsResponse$.next({ ...driver.statisticsMsg })
    console.log('Sensor error received!\n');
    driver.statisticsMsg.state = TableActionState.STATISTICS_IDLE
  }

}

{/****************************************************************************
 * Name: createTableDriver
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
export const createTableDriver = (serialPortPath): TableDriver => {
  return {
    statisticsMsg: {
      path: serialPortPath,
      state: TableActionState.STATISTICS_IDLE,
      flag: 0,
      cmd: 0,
      length: 0,
      buffer: [],
      checksum: 0,
      collecting: false
    },
    statisticsResponse$: createStatisticsResponse$()
  }
}

{/****************************************************************************
 * Name: parseTableCommand
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
const parseTableCommand = (driver: TableDriver, cmd: TableActionState) => {
  const { statisticsMsg, statisticsResponse$ } = driver

  switch (cmd) {
    case TableActionState.STATISTICS_COLLECTING:
      statisticsMsg.collecting = true;
      startAndStopCapturing(driver, cmd);
      break;
    case TableActionState.STATISTICS_ENDED_COLLECTING:
      statisticsMsg.collecting = false;
      startAndStopCapturing(driver, cmd);
      break;
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
function startAndStopCapturing(driver:TableDriver, cmd: TableActionState) {

  const { statisticsMsg, statisticsResponse$ } = driver
          console.log("YES: "+driver.statisticsMsg.collecting);
          console.log("PATH:"+driver.statisticsMsg.path);

          var nResults = 0;
          var xValSum = 0;
          var xMax = 0;
          var xMin = 0;
  
          var yValSum = 0;
          var yMax = 0;
          var yMin = 0;

          var zValSum = 0;
          var zMax = 0;
          var zMin = 0;
  
          lrangeAsync(driver.statisticsMsg.path + '_Accelero_X', 0, -1).then(function (result: string[]) {

              if (result) {

                nResults = result.length; 
              
                for (let j = 0; j < (result.length); j++) {
                  var vali = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */
                  var valStr = vali.split("\^");

                  var yyes = valStr[2].includes("y:");
                  
                  if (yyes) {

                    var xi = parseFloat(valStr[2].split("y:")[1].valueOf());

                    //console.log(""+yi.toFixed(2));

                    xValSum += xi;

                    if (xi < xMin)
                    {
                      xMin = xi;
                    }

                    if (xi > xMax)
                    {
                      xMax = xi;
                    }

                  }
                  
                }

                var oVar = yValSum / (nResults - 1);

                console.log("nResults: "+nResults.toFixed(2));
                console.log("xValSum: "+xValSum.toFixed(2));
                console.log("xMin: "+xMin.toFixed(2));
                console.log("xMax: "+xMax.toFixed(2));
                console.log("oValSum: "+ oVar.toFixed(2));

                /* push statistiek naar Redis primair */

                lpushAsync(driver.statisticsMsg.path+'_statistics', "xMin:" + xMin.toFixed(2));
                lpushAsync(driver.statisticsMsg.path+'_statistics', "xMax:" + xMax.toFixed(2));

              }
             }
           );

           lrangeAsync(driver.statisticsMsg.path + '_Accelero_Y', 0, -1).then(function (result: string[]) {

            if (result) {

              nResults = result.length; 
            
              for (let j = 0; j < (result.length); j++) {
                var vali = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */
                var valStr = vali.split("\^");

                var yyes = valStr[2].includes("y:");
                
                if (yyes) {

                  var yi = parseFloat(valStr[2].split("y:")[1].valueOf());

                  //console.log(""+yi.toFixed(2));

                  yValSum += yi;

                  if (yi < yMin)
                  {
                    yMin = yi;
                  }

                  if (yi > yMax)
                  {
                    yMax = yi;
                  }

                }
                
              }

              /* De worpsnelheid is de hoek t.o.v. tijd. Dus stel arm rechtop en dan worp van terug halen naar maximaal en dan de tijd die is afgelegd = RPM */
 

              var oVar = yValSum / (nResults - 1);

              console.log("nResults: "+nResults.toFixed(2));
              console.log("yValSum: "+yValSum.toFixed(2));
              console.log("yMin: "+yMin.toFixed(2));
              console.log("yMax: "+yMax.toFixed(2));
              console.log("oValSum: "+ oVar.toFixed(2));

              /* push statistiek naar Redis primair */

              lpushAsync(driver.statisticsMsg.path+'_statistics', "yMin:" + yMin.toFixed(2));
              lpushAsync(driver.statisticsMsg.path+'_statistics', "yMax:" + yMax.toFixed(2));

            }
           }
         );

         lrangeAsync(driver.statisticsMsg.path + '_Accelero_Z', 0, -1).then(function (result: string[]) {

          if (result) {

            nResults = result.length; 
          
            for (let j = 0; j < (result.length); j++) {
              var vali = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */
              var valStr = vali.split("\^");

              var yyes = valStr[2].includes("y:");
              
              if (yyes) {

                var zi = parseFloat(valStr[2].split("y:")[1].valueOf());

                //console.log(""+yi.toFixed(2));

                zValSum += zi;

                if (zi < zMin)
                {
                  yMin = zi;
                }

                if (zi > zMax)
                {
                  yMax = zi;
                }

              }
              
            }

            var oVar = zValSum / (nResults - 1);

            console.log("nResults: "+nResults.toFixed(2));
            console.log("yValSum: "+zValSum.toFixed(2));
            console.log("yMin: "+zMin.toFixed(2));
            console.log("yMax: "+zMax.toFixed(2));
            console.log("oValSum: "+ oVar.toFixed(2));

            /* push statistiek naar Redis primair */

            lpushAsync(driver.statisticsMsg.path+'_statistics', "zMin:" + zMin.toFixed(2));
            lpushAsync(driver.statisticsMsg.path+'_statistics', "zMax:" + zMax.toFixed(2));

          }
         }
       );

          
          
          
          statisticsMsg.state = TableActionState.STATISTICS_IDLE
  }
}


