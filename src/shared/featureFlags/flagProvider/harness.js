/* eslint-disable no-restricted-imports */
import {
  // eslint-disable-next-line no-unused-vars
  Event,
  initialize as initHarness,
} from '@harnessio/ff-javascript-client-sdk'
import flowRight from 'lodash/flowRight'
import { createContext, useContext, useEffect, useState } from 'react'

import config from 'config'

import { camelizeKeys } from 'shared/utils/camelizeKeys'
import { kebabifyKeys } from 'shared/utils/kebabifyKeys'

let client

function convertLDUserToHarness(user) {
  return {
    identifier: user.ownerid,
    name: user.name,
    attributes: {
      ...user,
    },
  }
}

function initialize(user) {
  if (config.HARNESS) {
    console.log('harness init')
    client = initHarness(config.HARNESS, convertLDUserToHarness(user))
  }
}

const HarnessClient = createContext({
  client,
  initialize: initialize,
})

export const withHarnessProvider = (Component) => {
  if (config.HARNESS) {
    return flowRight(HarnessClient.Provider, Component)
  }
  return Component
}

function useHarness() {
  const harness = useContext(HarnessClient)

  if (harness.client) {
    return harness.client
  } else {
    console.error('Harness failed to initialize')
  }
  return {}
}

function setEvents({ events, client, fallback }) {
  return events.reduce(
    (prev, current) => ({
      ...prev,
      [current]: client?.variation(current, fallback[current]),
    }),
    {}
  )
}

function useFlags(fallback) {
  const Events = Object.keys(fallback)
  const initialFlags = Events.reduce(
    (prev, current) => ({ ...prev, [current]: fallback[current] }),
    {}
  )

  const client = useHarness()
  const [flags, setFlags] = useState(initialFlags)

  useEffect(() => {
    if (config.HARNESS && client) {
      // TODO set up event listeners to update state.
      setFlags(() => setEvents({ events: Events, client, fallback }))
    }
  }, [client, Events, fallback])

  return camelizeKeys(flags)
}

export function useHarnessFlags(fallback) {
  const flags = useFlags(kebabifyKeys(fallback))
  if (config.HARNESS) {
    return flags
  } else {
    // Throw an error to remind dev's we need to provide a fallback for self hosted.
    if (!fallback) {
      console.error(
        'Warning! Self hosted build is missing a default feature flag value.'
      )
    }
    return fallback
  }
}

export function useIdentifyHarnessUser(user) {
  const harness = useContext(HarnessClient)

  useEffect(() => {
    if (config.HARNESS) {
      if (!user?.guest && user?.key) {
        harness.initialize(user)
      }
    }
  }, [user, harness])
}
