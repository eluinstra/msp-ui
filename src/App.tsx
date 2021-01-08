import React, { useState } from 'react'
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { AppBar, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import { BatteryStd as BatteryStdIcon, Build as BuildIcon, GpsFixed as GpsFixedIcon, Home as HomeIcon, Info as InfoIcon, Input as InputIcon, Power as PowerIcon, Repeat as RepeatIcon, Settings as SettingsIcon, ShowChart as ShowChartIcon } from '@material-ui/icons'
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { AboutPage } from '@/page/About'
import { ConfigurationPage } from '@/page/Configuration'
import { GPSPage } from './page/GPS'
import { HomePage } from '@/page/Home'
import { MspInputPage } from '@/page/MspInput'
import { MspChartPage } from '@/page/MspChart'
import { PortsPage } from '@/page/Ports'
import { SettingsPage } from '@/page/Settings'
import { PowerAndBatteryPage } from '@/page/Power'
import { SerialPortConnect } from '@/component/serialport/SerialPortConnect'

const drawerWidth = 240

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#4a6572',
      main: '#344955',
      dark: '#232f34',
    },
    secondary: {
      main: '#f9aa33',
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
  const [ connected, setConnected ] = useState(false)
  return (
  <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} maxSnack={3} preventDuplicate>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <div className={root}>
        <MSPAppBar classes={classes} connected={connected} setConnected={setConnected}/>
        <Router>
          <MSPDrawer classes={classes} connected={connected}/>
          <main className={content}>
            <Toolbar className={toolbar} />
            <MSPRouter />
          </main>
        </Router>
      </div>
    </ThemeProvider>
  </SnackbarProvider>
  )
}

const MSPAppBar = props => {
  const { classes, connected, setConnected } = props
  const { appBar, toolbar, title } = classes
  return (
    <AppBar position="fixed" className={appBar}>
      <Toolbar className={toolbar}>
        <Typography variant="h6" className={title}>
          Alpha|BOT
        </Typography>
        <SerialPortConnect connected={connected} setConnected={setConnected}/>
      </Toolbar>
    </AppBar>
  )
}

const MSPDrawer = props => {
  const { classes, connected } = props
  const { drawer, drawerPaper, toolbar, drawerContainer } = classes
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
        <List>
          <MenuListItem text="Home" to="/" icon={<HomeIcon />} />
          {connected && (
            <React.Fragment>
              <MenuListItem text="Settings" to="/settings" icon={<BuildIcon />} />
              <MenuListItem text="Ports" to="/ports" icon={<PowerIcon />} />
              <MenuListItem text="Configuration" to="/configuration" icon={<SettingsIcon />} />
              <MenuListItem text="Power & Battery" to="/power" icon={<BatteryStdIcon />} />
              <MenuListItem text="MSP Input" to="/msp-input" icon={<InputIcon />} />
              <MenuListItem text="MSP Chart" to="/msp-chart" icon={<ShowChartIcon />} />
            </React.Fragment>
          )}
          <MenuListItem text="GPS" to="/gps" icon={<GpsFixedIcon />} />
          <MenuListItem text="About" to="/about" icon={<InfoIcon />} />
        </List>
      </div>
    </Drawer>
  )
}

const MenuListItem = props => {
  const { text, to, icon } = props
  return (
    <ListItem button key={text} component={Link} to={to}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  )
}

const MSPRouter = props => {
  const { connected } = props
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
      <Route path="/msp-input">
        <MspInputPage />
      </Route>
      <Route path="/msp-chart">
        <MspChartPage />
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
