import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import Jlox from './pages/jlox';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Jlox} ></Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}
export default App;
