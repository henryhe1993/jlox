import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import Jlox from './pages/jlox/jlox';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/jlox" component={Jlox} ></Route>
        <Redirect to="/jlox" />
      </Switch>
    </Router>
  );
}
export default App;
