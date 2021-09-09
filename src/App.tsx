import { useStatefulObservable } from '@/common/RxTools'
import { SerialPortConnect } from '@/component/serialport/SerialPortConnect'
import { createSerialPort, isOpen, SerialPort } from '@/component/serialport/SerialPortDriver'
import { AboutPage } from '@/page/About'
import { ConfigurationPage } from '@/page/Configuration'
import { HomePage } from '@/page/Home'
import { MspInputPage } from '@/page/MspInput'
import { PortsPage } from '@/page/Ports'
import { AppBar, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import { blueGrey, orange } from "@material-ui/core/colors"
import { createTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import {
  Home as HomeIcon, Info as InfoIcon,
  Input as InputIcon, Power as PowerIcon, Settings as SettingsIcon
} from '@material-ui/icons'
import { SnackbarProvider } from 'notistack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import { map } from 'rxjs/operators'

const drawerWidth = 240

const theme = createTheme({
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

export const App = ({ }) => {
  const classes = useStyles()
  const { content, toolbar, root } = classes
  const [ serialPort ] = useState(createSerialPort())
  
  return (
    <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} maxSnack={3} preventDuplicate>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <div className={root}>
          <MSPAppBar classes={classes} serialPort={serialPort} />
          <Router>
            <MSPDrawer classes={classes} serialPort={serialPort} />
            <main className={content}>
              <Toolbar className={toolbar} />
              <MSPRouter serialPort={serialPort} />
            </main>
          </Router>
        </div>
      </ThemeProvider>
    </SnackbarProvider>
  )
}

const MSPAppBar = ({ classes, serialPort }) => {
  const { appBar, toolbar, title } = classes
  const { t } = useTranslation()
  return (
    <AppBar position="fixed" className={appBar}>
      <Toolbar className={toolbar}>
        <Typography variant="h6" className={title}>
        {t('app.title')}
        </Typography>
        <SerialPortConnect serialPort={serialPort} />
      </Toolbar>
    </AppBar>
  )
}

const MSPDrawer = ({ classes, serialPort }) => {
  const { t } = useTranslation()
  const { drawer, drawerPaper, toolbar, drawerContainer } = classes
  const connected = useStatefulObservable<boolean>((serialPort as SerialPort).pipe(map(p => isOpen(p))),false)
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
          <MenuListItem text={t('lbl.home')} to="/" icon={<HomeIcon />} />
          <MenuListItem text={t('lbl.ports')} to="/ports" icon={<PowerIcon />} />
          {connected && (
            <React.Fragment>
              <MenuListItem text={t('lbl.configuration')} to="/configuration" icon={<SettingsIcon />} />
              <MenuListItem text={t('lbl.msp')} to="/msp-input" icon={<InputIcon />} />
            </React.Fragment>
          )}
          <MenuListItem text={t('lbl.about')} to="/about" icon={<InfoIcon />} />
        </List>
      </div>
    </Drawer>
  )
}

const MenuListItem = ({ text, to, icon }) => {
  const location = useLocation('/')
  return (
    <ListItem button key={text} component={Link} to={to} selected={location.pathname == to}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  )
}

const MSPRouter = ({ serialPort }) => {
  return (
    <Switch>
      <Route path="/ports">
        <PortsPage />
      </Route>
      <Route path="/configuration">
        <ConfigurationPage serialPort={serialPort} />
      </Route>
      <Route path="/msp-input">
        <MspInputPage serialPort={serialPort} />
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
