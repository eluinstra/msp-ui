import React, { useEffect, useState } from 'react'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import {
  AppBar, ButtonGroup, Button, BottomNavigation, BottomNavigationAction, CssBaseline, Drawer, Grid, List, ListItem, ListItemIcon,
  ListItemText, Paper, Toolbar, Typography
} from '@material-ui/core'
import {
  ArrowBackIos as ArrowBackIosIcon, AlbumOutlined as AlbumOutlined, BatteryStd as BatteryStdIcon, Build as BuildIcon, TrackChanges as TrackChangesIcon,
  GpsFixed as GpsFixedIcon, Home as HomeIcon, Info as InfoIcon, Equalizer as EqualizerIcon, Favorite as FavoriteIcon, LocationOn as LocationOnIcon,
  Input as InputIcon, OpenWith as OpenWithIcon, Power as PowerIcon, Repeat as RepeatIcon, Settings as SettingsIcon, ShowChart as ShowChartIcon
} from '@material-ui/icons'

import { llenAsync, lpushAsync, lrangeAsync, flushallAsync } from '@/services/dbcapturing'
import ReactApexChart from 'react-apexcharts'
import { makeStyles } from '@material-ui/core/styles';
import { ExampleChart4 } from '@/component/witmotion/ExampleChart4'
import { ExampleChart5 } from '@/component/witmotion/ExampleChart5'
import { ExampleTable } from '@/component/witmotion/ExampleTable'
import { createSensorDriver, getSensorResponse$, SensorState, SensorMsg, sensorRequest } from '@/component/witmotion/WitMotionDriver'
import { useStatefulObservable, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { useSnackbar } from 'notistack'

enum Mode { DEFAULT, COLLECTING, IDLE }
enum ChartMode { DEFAULT, REALTIME, CHART4 }
enum StatsMode { DEFAULT, STATS }

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export const MainContainer = props => {
  const { serialPort1, serialPort2 } = props
  const { enqueueSnackbar } = useSnackbar()
  const [driver1] = useState(createSensorDriver(serialPort1))
  const [driver2] = useState(createSensorDriver(serialPort2))
  const [mode, setMode] = useState(Mode.DEFAULT)
  const [navValue, setNavValue] = useState('')
  const [chartMode, setChartMode] = useState(ChartMode.DEFAULT)
  const [statsMode, setStatsMode] = useState(StatsMode.DEFAULT)
  
  const sensorMsg1 = useStatefulObservable<SensorMsg>(getSensorResponse$(driver1)
  .pipe(
    //map(viewSensorMsg)
))

  //useEffect(useSensorDriverEffect(driver1, enqueueSnackbar), [])

  const classes = useStyles();

  function clickCollectingEvent(event) {
    setMode(Mode.COLLECTING);

    {/* Trigger with a subject the respons object of the driver */}

    try {
      sensorRequest(driver1, SensorState.SENSOR_COLLECTING, 'collecting-driver1')
      sensorRequest(driver2, SensorState.SENSOR_COLLECTING, 'collecting=driver2')
    } catch(e) {
      console.log(e)
      enqueueSnackbar(e.message, { variant: 'error' })
    }


  }

  function clickCollectingEndEvent(event) {
    setMode(Mode.DEFAULT);

    try {
      sensorRequest(driver1, SensorState.SENSOR_ENDED_COLLECTING, 'end-collecting-driver1')
      sensorRequest(driver2, SensorState.SENSOR_ENDED_COLLECTING, 'end-collecting-driver2')
    } catch(e) {
      console.log(e)
      enqueueSnackbar(e.message, { variant: 'error' })
    }
  }

  function clickFlushDataEvent(event) {

    try {
      sensorRequest(driver1, SensorState.SENSOR_FLUSHING, 'flushing-driver1')
      sensorRequest(driver2, SensorState.SENSOR_FLUSHING, 'flushing-driver2')
    } catch(e) {
      console.log(e)
      enqueueSnackbar(e.message, { variant: 'error' })
    }

  }

  function clickRealtimeChartEvent(event) {
    if (chartMode != ChartMode.REALTIME) {
      setChartMode(ChartMode.REALTIME);
    }
    else {
      setChartMode(ChartMode.DEFAULT);
    }
  }

  function clickChart4Event(event) {
    if (chartMode != ChartMode.CHART4) {
      setChartMode(ChartMode.CHART4);
    }
    else {
      setChartMode(ChartMode.DEFAULT);
    }
  }

  function handleChange(event, value) {
    //this.setState({ value });
    console.log("-->" + value)
    if (value == 'stats') {
      if (statsMode != StatsMode.STATS) {
        setStatsMode(StatsMode.STATS);
      }
      else {
        setStatsMode(StatsMode.DEFAULT);
      }
    }
  };
  useEffect(() => {
    //console.log("-->"+navValue)
  }, [mode])
  return (

    <div>
      <React.Fragment>
        <Grid container spacing={3}>
          {mode == Mode.DEFAULT &&
            <Grid item xs={12}>
              <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                <Button onClick={() => { { clickCollectingEvent(this) } }} >COLLECTING</Button>
                <Button disabled>END COLLECTING</Button>
                <Button onClick={() => { { clickFlushDataEvent(this) } }}>FLUSH DATA</Button>
                <Button onClick={() => { { clickRealtimeChartEvent(this) } }}>REAL TIME CHART</Button>
                <Button onClick={() => { { clickChart4Event(this) } }}>CHART4</Button>
              </ButtonGroup>
            </Grid>
          }
          {mode == Mode.COLLECTING &&
            <Grid item xs={12}>
              <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                <Button disabled>COLLECTING</Button>
                <Button onClick={() => { { clickCollectingEndEvent(this) } }} >END COLLECTING</Button>
                <Button onClick={() => { { clickFlushDataEvent(this) } }}>FLUSH DATA</Button>
                <Button onClick={() => { { clickRealtimeChartEvent(this) } }}>REAL TIME CHART</Button>
                <Button onClick={() => { { clickChart4Event(this) } }}>CHART4</Button>
              </ButtonGroup>
            </Grid>
          }
          <Grid item xs={12}>
            <Paper elevation={3} className={classes.paper}>
              With pressing the 'COLLECTING' button one is capturing data from the opened serial ports
              on which the sensors are connected.<br />
              With pressing the 'END COLLECTING' button one is ending the process of capturing data
              from the sensors. And also the statistics are being processed.
            </Paper>
          </Grid>
          {/* Here are the charts which can be called on */}
          <Grid item xs={12}>
            {chartMode == ChartMode.REALTIME &&
              <ExampleChart4 />
            }
            {chartMode == ChartMode.CHART4 &&
              <ExampleChart5 />
            }
          </Grid>
          {/* Here are the statistics which can be called on */}
          <Grid item xs={12}>
            {statsMode == StatsMode.DEFAULT &&
              <div />
            }
            {statsMode == StatsMode.STATS &&
              <ExampleTable />
            }
          </Grid>
          <Grid item xs={12}>
            <BottomNavigation
              value={navValue}
              onChange={handleChange}
              showLabels
            >
              <BottomNavigationAction label="Stats" icon={<EqualizerIcon />} value="stats" />
              <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} value="favorites" />
              <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} value="nearby" />
            </BottomNavigation>
          </Grid>
        </Grid>
      </React.Fragment>
    </div>

  )
}