import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import LoginForm from './LoginForm';
import MainPage from 'pages/main/MainPage';
import { CircularProgress } from '@mui/material';

function LoginAction() {
  const { store } = useContext(Context);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      store.checkAuth();
    }
  }, []);

  if (store.isLoading) {
    return <CircularProgress />;
  }

  return !store.isAuth ? (
    <LoginForm />
  ) : !store.user.isActivated ? (
    <h2>Подтвердите аккаунт по почте</h2>
  ) : (
    <>
      <MainPage />
    </>
  );
}

export default observer(LoginAction);
