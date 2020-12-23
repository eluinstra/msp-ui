import React from 'react'
import ReactDOM from 'react-dom'
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { AppBar, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import { BatteryStd as BatteryStdIcon, Build as BuildIcon, Home as HomeIcon, Info as InfoIcon, Input as InputIcon, Power as PowerIcon, Settings as SettingsIcon, SettingsInputHdmi as SettingsInputHdmiIcon } from '@material-ui/icons';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import { About } from '@/page/about'
import { Configuration } from './page/configuration';
import { Home } from '@/page/home'
import { MSP } from '@/page/msp'
import { Ports } from '@/page/ports'
import { Settings } from './page/settings';
import { Power } from './page/power';

const drawerWidth = 240;

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#4a6572',
      main: '#344955',
      dark: '#232f34'
    },
    secondary: {
      main: '#f9aa33'
    }
  }
});

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
    alignSelf: 'flex-end'
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
}));

const MenuListItem = (props) => {
  return <ListItem button key={props.text} component={Link} to={props.to}>
      <ListItemIcon>{props.icon}</ListItemIcon>
      <ListItemText primary={props.text} />
    </ListItem>
}

export const App = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <Typography variant="h6" className={classes.title}>
              MSP
            </Typography>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
            >
              <SettingsInputHdmiIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Router>
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper
            }}
          >
            <Toolbar className={classes.toolbar} />
            <div className={classes.drawerContainer}>
              <List>
                <MenuListItem text="Home" to="/" icon={<HomeIcon />} />
                <MenuListItem text="Settings" to="/settings" icon={<BuildIcon />} />
                <MenuListItem text="Ports" to="/ports" icon={<PowerIcon />} />
                <MenuListItem text="Configuration" to="/configuration" icon={<SettingsIcon />} />
                <MenuListItem text="Power & Battery" to="/power" icon={<BatteryStdIcon />} />
                <MenuListItem text="MSP" to="/msp" icon={<InputIcon />} />
                <MenuListItem text="About" to="/about" icon={<InfoIcon />} />
              </List>
            </div>
          </Drawer>
          <main className={classes.content}>
            <Toolbar className={classes.toolbar} />
            <Switch>
              <Route path="/settings">
                <Settings />
              </Route>
              <Route path="/ports">
                <Ports />
              </Route>
              <Route path="/configuration">
                <Configuration />
              </Route>
              <Route path="/power">
                <Power />
              </Route>
              <Route path="/msp">
                <MSP />
              </Route>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </main>
        </Router>
      </ThemeProvider>
    </div>
  )
}

