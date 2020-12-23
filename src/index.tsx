import React from 'react'
import ReactDOM from 'react-dom'
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { AppBar, CssBaseline, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import { Build as BuildIcon, Home as HomeIcon, Info as InfoIcon, Input as InputIcon, Power as PowerIcon, Settings as SettingsIcon } from '@material-ui/icons';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import { About } from '@/page/about'
import { Configuration } from './page/configuration';
import { Home } from '@/page/home'
import { MSP } from '@/page/msp'
import { Ports } from '@/page/ports'
import { Settings } from './page/settings';

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
          <Toolbar>
            <Typography variant="h6" noWrap>
              MSP
            </Typography>
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
            <Toolbar />
            <div className={classes.drawerContainer}>
              <List>
                <MenuListItem text="Home" to="/" icon={<HomeIcon />} />
                <MenuListItem text="Settings" to="/settings" icon={<BuildIcon />} />
                <MenuListItem text="Ports" to="/ports" icon={<PowerIcon />} />
                <MenuListItem text="Configuration" to="/configuration" icon={<SettingsIcon />} />
                <MenuListItem text="MSP" to="/msp" icon={<InputIcon />} />
                <MenuListItem text="About" to="/about" icon={<InfoIcon />} />
              </List>
            </div>
          </Drawer>
          <main className={classes.content}>
            <Toolbar />
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

