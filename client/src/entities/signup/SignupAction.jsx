import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import SignupForm from './SignupForm';
import MainPage from 'pages/main/MainPage';
import { CircularProgress } from '@mui/material';

function SignupAction() {
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
    <SignupForm />
  ) : !store.user.isActivated ? (
    <h2>Подтвердите аккаунт по почте</h2>
  ) : (
    <MainPage />
  );
}

export default observer(SignupAction);
