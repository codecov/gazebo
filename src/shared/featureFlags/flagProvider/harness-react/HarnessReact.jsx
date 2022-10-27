// This file would ideally be provided by harness, putting it in this sub folder to be clear.

/* eslint-disable no-restricted-imports */
import { Event } from '@harnessio/ff-javascript-client-sdk'
import { createContext, useContext, useEffect, useReducer, useRef } from 'react'

import { camelizeKeys } from 'shared/utils/camelizeKeys'

import harnessReducer from './harnessReducer'
import { initHarnessAsync } from './initHarness'

const HarnessFlags = createContext(null)
const HarnessSet = createContext(null)

export function useHarness() {
  return useContext(HarnessFlags)
}

function useHarnessSet() {
  return useContext(HarnessSet)
}

export function useHarnessInit({ key, user, enabled = false, options = {} }) {
  const dispatch = useHarnessSet()
  const client = useRef()
  useEffect(() => {
    if (!client.current && enabled) {
      client.current = initHarnessAsync({ key, user, options }).then(
        (harness) => {
          dispatch({ type: 'setupHarness', harness })
        }
      )
    }

    return null
  }, [enabled, key, client, user, options, dispatch])
  // I had trouble getting the above to only run once.
}

export function useFlags() {
  const { flags } = useHarness()

  return camelizeKeys(flags)
}

export function withHarnessProvider(Component) {
  return function Wrapper(props) {
    const [harness, dispatch] = useReducer(harnessReducer, {
      flags: {},
      client: null,
    })

    useEffect(() => {
      if (!!harness.client) {
        harness.client.on(Event.CHANGED, ({ flag, value }) =>
          dispatch({ type: 'updateFlag', value, flag })
        )
      }
      return () => {
        harness?.client?.off(Event.CHANGED)
      }
    }, [harness.client, dispatch, harness])

    return (
      <HarnessSet.Provider value={dispatch}>
        <HarnessFlags.Provider value={harness}>
          <Component {...props} />
        </HarnessFlags.Provider>
      </HarnessSet.Provider>
    )
  }
}
