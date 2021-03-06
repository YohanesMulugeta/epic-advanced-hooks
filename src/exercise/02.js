// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

function useSafeDispatch(unsafeDispatch) {
  const unmountedRef = React.useRef(false)

  React.useLayoutEffect(() => {
    unmountedRef.current = true

    return () => {
      unmountedRef.current = false
    }
  }, [])

  return React.useCallback(
    (...args) => {
      if (unmountedRef.current) unsafeDispatch(...args)
    },
    [unsafeDispatch],
  )
}

function useAsync(intialValue) {
  function pokemonInfoReducer(previousState, action) {
    switch (action.type) {
      case 'pending': {
        return {status: 'pending', data: null, error: null}
      }
      case 'resolved': {
        return {status: 'resolved', data: action.data, error: null}
      }
      case 'rejected': {
        return {status: 'rejected', data: null, error: action.error}
      }
      default: {
        throw new Error(`Unhandled action type: ${action.type}`)
      }
    }
  }

  // ------------------------------------------------------------------------ the dispatch returned from useReducer is a memkoized never changes through
  const [state, unsafeDispatch] = React.useReducer(
    pokemonInfoReducer,
    intialValue,
  )

  const dispatch = useSafeDispatch(unsafeDispatch)

  const run = React.useCallback(
    promise => {
      // ------------------------------------------------- because in every search we want to display the fall back screen
      dispatch({type: 'pending'})

      promise.then(
        data => dispatch({type: 'resolved', data}),
        error => dispatch({type: 'rejected', error}),
      )
    },
    [dispatch],
  )

  return {run, ...state}
}

function PokemonInfo({pokemonName}) {
  // const promise = () => (pokemonName ? fetchPokemon(pokemonName) : undefined)

  const {
    data: pokemon,
    status,
    error,
    run,
  } = useAsync({
    status: pokemonName ? 'pending' : 'idle',
    data: null,
    error: null,
  })

  React.useEffect(() => {
    if (!pokemonName) return

    const pokemonPromise = fetchPokemon(pokemonName)

    run(pokemonPromise)
  }, [run, pokemonName])

  // const {data, status, error} = state

  switch (status) {
    case 'idle':
      return <span>Submit a pokemon</span>
    case 'pending':
      return <PokemonInfoFallback name={pokemonName} />
    case 'rejected':
      throw error
    case 'resolved':
      return <PokemonDataView pokemon={pokemon} />
    default:
      throw new Error('This should be impossible')
  }
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
