import { useEffect } from 'react'
import Service from './test'

import logo from './logo.svg'
import './App.css'

function App() {
  useEffect(() => {
    Service.get({
      path: '/profile',
    })
      .then(console.log)
      .error(console.error)
    Service.get({
      path: '/github/codecov/repos/java-standard/',
    })
      .then(console.log)
      .error(console.error)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React :)
        </a>
      </header>
    </div>
  )
}

export default App
