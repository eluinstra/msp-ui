import React, { useEffect, useState } from 'react'
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { AppBar, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import { ArrowBackIos as ArrowBackIosIcon, AlbumOutlined as AlbumOutlined, BatteryStd as BatteryStdIcon, Build as BuildIcon,TrackChanges as TrackChangesIcon,
          GpsFixed as GpsFixedIcon, Home as HomeIcon, Info as InfoIcon, 
          Input as InputIcon, OpenWith as OpenWithIcon, Power as PowerIcon, Repeat as RepeatIcon, Settings as SettingsIcon, ShowChart as ShowChartIcon } from '@material-ui/icons'
import { blueGrey, orange } from "@material-ui/core/colors";
import { useLocation } from 'react-router'
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { AboutPage } from '@/page/About'
import { ConfigurationPage } from '@/page/Configuration'
import { GPSPage } from './page/GPS'
import { HomePage } from '@/page/Home'
import { Imu } from '@/page/Imu'
import { Msp } from '@/page/Msp'
import { MspInputPage } from '@/page/MspInput'
import { MspChartPage } from '@/page/MspChart'
import { PortsPage } from '@/page/Ports'
import { SettingsPage } from '@/page/Settings'
import { PowerAndBatteryPage } from '@/page/Power'
import { ExampleTable } from '@/component/witmotion/ExampleTable'
import { ExampleChart2 } from '@/component/witmotion/ExampleChart2'
import { RealTimeChart } from '@/component/witmotion/RealTimeChart'
import { ExampleChart5 } from '@/component/witmotion/ExampleChart5'
import { ExampleChart6 } from '@/component/witmotion/ExampleChart6'
import { SerialRTChartPage } from '@/page/SerialRTChartPage'
import { MainContainer } from '@/component/witmotion/MainContainer'
import { AudioPlayExample } from '@/component/witmotion/AudioPlayExample'
import { WitMotion } from '@/page/WitMotion'
import { SerialPortConnect } from '@/component/serialport/SerialPortConnect'
import { createSerialPort, isOpen } from '@/component/serialport/SerialPortDriver';
import { useStatefulObservable } from '@/common/RxTools'
import { map } from 'rxjs/operators';

enum Mode { DEFAULT, MSP, IMU } 

const drawerWidth = 240

const theme = createMuiTheme({
  palette: {
    primary: {
      light: blueGrey[600],
      main: blueGrey[700],
      dark: blueGrey[800],
    },
    secondary: {
      main: orange[400],
    },
  },
  props: {
    MuiAppBar: {
      color: 'primary',
      style: {
        color: 'white'
      }
    },
    MuiButton: {
      color: 'secondary',
    },
    MuiSwitch: {
      color: 'secondary',
    },
  },
  overrides: {
    MuiDrawer: {
      paperAnchorDockedLeft: {
        borderRight: "3px solid " + orange[400]
      }
    },
    MuiListItem: {
      root: {
        "&$selected": {
          backgroundColor: orange[400],
          "&:hover": {
            backgroundColor: orange[600]
          }
        }
      },
      button: {
        "&:hover": {
          backgroundColor: orange[200]
        },
      }
    },
    MuiTableCell: {
      head: {
          fontWeight: "bold",
      },
    },
  },
})

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbar: {
    minHeight: 128,
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    alignSelf: 'center',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}))

export const App = () => {
  const classes = useStyles()
  const { content, toolbar, root } = classes
  const [ serialPort1 ] = useState(createSerialPort())
  const [ serialPort2 ] = useState(createSerialPort())
  return (
  <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} maxSnack={3} preventDuplicate>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <div className={root}>
        <MSPAppBar classes={classes} serialPort1={serialPort1} serialPort2={serialPort2} /> 
        <Router>
          <MSPDrawer classes={classes} serialPort={serialPort1} />
          <main className={content}>
            <Toolbar className={toolbar} />
            <MSPRouter serialPort1={serialPort1} serialPort2={serialPort2} />
          </main>
        </Router>
      </div>
    </ThemeProvider>
  </SnackbarProvider>
  )
}

const MSPAppBar = props => {
  const { classes, serialPort1, serialPort2 } = props
  const { appBar, toolbar, title } = classes
  return (
    <AppBar position="fixed" className={appBar}>
      <Toolbar className={toolbar}>
        <Typography variant="h6" className={title}>
          BOT4Darts
        </Typography>
        <SerialPortConnect serialPort={serialPort1} />
        <SerialPortConnect serialPort={serialPort2} />
      </Toolbar>
    </AppBar>
  )
}

const MSPDrawer = props => {
  const { classes, serialPort } = props
  const { drawer, drawerPaper, toolbar, drawerContainer } = classes
  const [ mode, setMode ] = useState(Mode.DEFAULT)
  const connected = useStatefulObservable<boolean>(serialPort.pipe(map(p => isOpen(p))),false)
  return (
    <Drawer
      className={drawer}
      variant="permanent"
      classes={{
        paper: drawerPaper
      }}
    >
      <Toolbar className={toolbar} />
      <div className={drawerContainer}>
        {mode == Mode.DEFAULT &&
          <List>
            <MenuListItem text="Home" to="/" icon={<HomeIcon />} setMode={setMode} />
            {connected && (
              <React.Fragment>
                <MenuListItem text="Settings" to="/settings" icon={<BuildIcon />} setMode={setMode} />
                <MenuListItem text="Ports" to="/ports" icon={<PowerIcon />} setMode={setMode} />
                <MenuListItem text="Configuration" to="/configuration" icon={<SettingsIcon />} setMode={setMode} />
                {/* <MenuListItem text="Power & Battery" to="/power" icon={<BatteryStdIcon />} setMode={setMode} /> */}
                {/* <MenuListItem text="MSP" to="/msp" icon={<InputIcon />} mode={Mode.MSP} setMode={setMode} /> */}
                <MenuListItem text="DSA" to="/imu" icon={<TrackChangesIcon />} mode={Mode.IMU} setMode={setMode} />
              </React.Fragment>
            )}
            {/* <MenuListItem text="GPS" to="/gps" icon={<GpsFixedIcon />} setMode={setMode} /> */}
            <MenuListItem text="About" to="/about" icon={<InfoIcon />} setMode={setMode} />
          </List>
        }
        {/* {mode == Mode.MSP && (
          <React.Fragment>
            <MenuListItem text="MSP" to="/" icon={<ArrowBackIosIcon />} setMode={setMode} />
            <MenuListItem text="Input" to="/msp-input" icon={<InputIcon />} mode={Mode.MSP} setMode={setMode} />
            <MenuListItem text="Chart" to="/msp-chart" icon={<ShowChartIcon />} mode={Mode.MSP} setMode={setMode} />
          </React.Fragment>
        )} */}
        {mode == Mode.IMU && (
          <React.Fragment>
            <MenuListItem text="Do Some Analytics" to="/" icon={<TrackChangesIcon />} setMode={setMode} />
            {/* <MenuListItem text="Live Tracker" to="/wit-motion" icon={<ShowChartIcon />} mode={Mode.IMU} setMode={setMode} /> */}
            <MenuListItem text="Darting" icon={<AlbumOutlined />} to="/darting" mode={Mode.IMU} setMode={setMode} />
            <MenuListItem text="Main Container" to="/maincontainer" mode={Mode.IMU} setMode={setMode} />
            <MenuListItem text="Statistics" to="/dartstats" mode={Mode.IMU} setMode={setMode} />
            <MenuListItem text="Example2" to="/example2" mode={Mode.IMU} setMode={setMode} />
            <MenuListItem text="Example4" to="/example4" mode={Mode.IMU} setMode={setMode} />
            <MenuListItem text="Example5" to="/example5" mode={Mode.IMU} setMode={setMode} />
            <MenuListItem text="Example6" to="/example6" mode={Mode.IMU} setMode={setMode} />
            <MenuListItem text="Serial RT" to="/serialrtchart" mode={Mode.IMU} setMode={setMode} />
            <MenuListItem text="Audio Test" to="/audioplayexample" mode={Mode.IMU} setMode={setMode} />
          </React.Fragment>
        )}
      </div>
    </Drawer>
  )
}

const MenuListItem = props => {
  const location = useLocation('/')
  const { text, to, icon, mode = Mode.DEFAULT, setMode } = props
  return (
    <ListItem button key={text} component={Link} to={to} onClick={_ => setMode(mode)} selected={location.pathname == to}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  )
}

const MSPRouter = props => {
  const { serialPort1, serialPort2 } = props
  return (
    <Switch>
      <Route path="/settings">
        <SettingsPage />
      </Route>
      <Route path="/ports">
        <PortsPage />
      </Route>
      <Route path="/configuration">
        <ConfigurationPage />
      </Route>
      <Route path="/power">
        <PowerAndBatteryPage />
      </Route>
      {/* <Route path="/msp">
        <Msp />
      </Route>
      <Route path="/msp-input">
        <MspInputPage serialPort={serialPort1} />
      </Route>
      <Route path="/msp-chart">
        <MspChartPage serialPort={serialPort1} />
      </Route> */}
      <Route path="/imu">
        <Imu />
      </Route>
      {/* <Route path="/wit-motion">
        <WitMotion serialPort={serialPort1} />
      </Route> */}
      {/* <Route path="/darting">
        <UseWitMotionDriver serialPort1={serialPort1} serialPort2={serialPort2} />
      </Route> */}
      <Route path="/maincontainer">
        <MainContainer serialPort1={serialPort1} serialPort2={serialPort2} />
      </Route>
      <Route path="/dartstats">
        <ExampleTable />
      </Route>
      <Route path="/example2">
        <ExampleChart2 />
      </Route>
      <Route path="/example4">
        <RealTimeChart />
      </Route>
      <Route path="/example5">
        <ExampleChart5 />
      </Route>
      <Route path="/example6">
        <ExampleChart6 />
      </Route>
      <Route path="/serialrtchart">
        <SerialRTChartPage id={1} serialPort1={serialPort1} serialPort2={serialPort2}  />
      </Route>
      <Route path="/audioplayexample">
        <AudioPlayExample />
      </Route>
      <Route path="/gps">
        <GPSPage />
      </Route>
      <Route path="/about">
        <AboutPage />
      </Route>
      <Route path="/">
        <HomePage />
      </Route>
    </Switch>
  )
}
