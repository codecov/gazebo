/* eslint-disable no-restricted-imports */
import { Event, initialize } from '@harnessio/ff-javascript-client-sdk'

const initHarnessAsync = async ({ key, user, options = {} }) => {
  const harnessClient = initialize(key, user, options)

  return new Promise((resolve) => {
    harnessClient.on(Event.READY, (flags) => {
      harnessClient.off(Event.READY)
      resolve({ flags, client: harnessClient })
    })
    harnessClient.on(Event.ERROR, (flags) => {
      harnessClient.off(Event.ERROR)
      resolve({ flags: {}, client: harnessClient })
    })
  })
}

export { initHarnessAsync }
