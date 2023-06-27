import { Routing } from 'pages/index';
import { withProviders } from './providers/index';
import NavBar from 'shared/ui/navbar/NavBar';

const App = () => {
  return (
    <div className="app">
      <NavBar />
      <Routing />
    </div>
  );
};

export default withProviders(App);
