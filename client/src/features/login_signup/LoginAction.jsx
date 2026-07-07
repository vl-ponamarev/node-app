import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { UserContext } from '../../index';
import { MainPage } from 'pages';
import EnterForm from './ui/EnterForm';
import Loader from 'shared/ui/loader/Loader';

function LoginAction() {
  const { userStore } = useContext(UserContext);

  if (userStore.isLoading) {
    return <Loader />;
  }
  let user = undefined;
  const userString = localStorage.getItem('user');
  try {
    user = userString ? JSON.parse(userString) : {};
  } catch (error) {
    console.error('Ошибка при парсинге JSON:', error);
  }

  return !userStore.isAuth ? (
    <EnterForm action="login" user={user} />
  ) : !userStore.isActivated ? (
    <h2>Подтвердите аккаунт по почте</h2>
  ) : (
    <>
      <MainPage />
    </>
  );
}

export default observer(LoginAction);
