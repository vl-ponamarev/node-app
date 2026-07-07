import { useContext, useEffect } from 'react';
import { UserContext } from 'index';
import { withProviders } from './providers/index';
import Router from './Router';

const App = () => {
  const { userStore } = useContext(UserContext);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      userStore.checkAuth();
    }
  }, [userStore]);

  return <Router />;
};

export default withProviders(App);
