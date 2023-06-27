import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { AppBar, Box, Toolbar } from '@mui/material';
import { NavLink } from 'react-router-dom';
import Logout from 'entities/logout/Logout';
import { Context } from 'index';

const linkStyle = {
  textDecoration: 'none',
  color: 'white',
  fontFamily: 'Monospace',
  fontSize: 30
};

const NavBar = observer(() => {
  const { store } = useContext(Context);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Toolbar
          sx={{
            width: '100%',
            maxWidth: 1000,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}
        >
          {store.isAuth && <Logout />}
          <NavLink to="/" style={linkStyle}>
            Post-app
          </NavLink>
        </Toolbar>
      </AppBar>
    </Box>
  );
});

export default NavBar;
