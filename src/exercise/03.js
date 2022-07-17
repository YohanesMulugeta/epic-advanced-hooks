// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'

// 🐨 create your CountContext here with React.createContext

const IncrementContext = React.createContext()

function CountProvider(props) {
  const [count, setCount] = React.useState(0)

  const value = [count, setCount]

  //   🐨 create a `value` array with count and setCount
  //   🐨 return your context provider with the value assigned to that array and forward all the other props
  //   💰 more specifically, we need the children prop forwarded to the context provider

  return <IncrementContext.Provider value={value} {...props} />
}

function CountDisplay() {
  const [count] = React.useContext(IncrementContext)

  return <div>{`The current count is ${count}`}</div>
}

function Counter() {
  const [, setCount] = React.useContext(IncrementContext)
  const increment = () => setCount(c => c + 1)
  return <button onClick={increment}>Increment count</button>
}

function App() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  )
}

export default App
