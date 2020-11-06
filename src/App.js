import { Suspense, lazy } from 'react'

import { BrowserRouter, Switch, Route } from "react-router-dom";

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <Suspense fallback="loading...">
      <BrowserRouter>
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </BrowserRouter>
    </Suspense>
  );
}

export default App
