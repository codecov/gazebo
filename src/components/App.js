import { Suspense } from 'react'

import { BrowserRouter, Switch } from 'react-router-dom'

function App() {
  return (
    <Suspense fallback="loading...">
      <BrowserRouter>
        <Switch></Switch>
      </BrowserRouter>
    </Suspense>
  )
}

export default App
