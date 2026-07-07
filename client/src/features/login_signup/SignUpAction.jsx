import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { UserContext } from '../../index';
import { MainPage } from 'pages';
import EnterForm from './ui/EnterForm';
import Loader from 'shared/ui/loader/Loader';

function SignUpAction() {
  const { userStore } = useContext(UserContext);

  const {
    isAuth,
    user: { isActivated },
  } = userStore;

  if (userStore.isLoading) {
    return <Loader />;
  }

  return !isAuth ? (
    <EnterForm action="signup" />
  ) : !isActivated ? (
    <h2>Подтвердите аккаунт по почте</h2>
  ) : (
    <MainPage />
  );
}

export default observer(SignUpAction);
