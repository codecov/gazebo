import Cookies from 'js-cookie'
import React, { useCallback, useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import config, {
  COOKIE_SESSION_EXPIRY,
  COOKIE_SESSION_ID,
  LOCAL_STORAGE_SESSION_EXPIRED_KEY,
  LOCAL_STORAGE_SESSION_TRACKING_KEY,
} from 'config'

const ONE_MINUTE_MILLIS = 60 * 1000
const TWO_MINUTES_MILLIS = 2 * ONE_MINUTE_MILLIS
const THIRTY_MINUTES_MILLIS = 30 * ONE_MINUTE_MILLIS

const SessionExpiryTracker: React.FC = () => {
  localStorage.setItem(LOCAL_STORAGE_SESSION_TRACKING_KEY, 'true')
  localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRED_KEY)

  const [redirectToLogout, setRedirectToLogout] = useState(false)
  const sessionExpiryTimeString = Cookies.get(COOKIE_SESSION_EXPIRY)
  const getCheckDelay = (sessionExpiryTime: Date) => {
    const timeLeft = sessionExpiryTime.getTime() - new Date().getTime()
    return timeLeft > THIRTY_MINUTES_MILLIS
      ? timeLeft - THIRTY_MINUTES_MILLIS
      : 0
  }

  const checkSession = useCallback(
    (sessionExpiryTime: Date) => {
      const currentTime = new Date()
      const timeLeft = sessionExpiryTime.getTime() - currentTime.getTime()
      if (timeLeft <= TWO_MINUTES_MILLIS && !redirectToLogout) {
        setRedirectToLogout(true)
      }
    },
    [redirectToLogout]
  )

  const setupSessionIntervalCheck = useCallback(
    (sessionExpiryTime: Date) => {
      return window.setInterval(() => {
        checkSession(sessionExpiryTime)
      }, ONE_MINUTE_MILLIS)
    },
    [checkSession]
  )

  useEffect(() => {
    if (!sessionExpiryTimeString) {
      return
    }
    const sessionExpiryTime = new Date(sessionExpiryTimeString)

    let intervalId: number
    const delayBeforeStart = getCheckDelay(sessionExpiryTime)
    const timeoutId = setTimeout(() => {
      intervalId = setupSessionIntervalCheck(sessionExpiryTime)
      checkSession(sessionExpiryTime)
    }, delayBeforeStart)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [sessionExpiryTimeString, checkSession, setupSessionIntervalCheck])

  if (!sessionExpiryTimeString || !redirectToLogout) {
    return null
  }

  Cookies.remove(COOKIE_SESSION_ID, { path: '' })
  Cookies.remove(COOKIE_SESSION_EXPIRY)
  localStorage.setItem(LOCAL_STORAGE_SESSION_EXPIRED_KEY, 'true')
  localStorage.removeItem(LOCAL_STORAGE_SESSION_TRACKING_KEY)

  return config.IS_SELF_HOSTED ? (
    <Redirect to={'/'} />
  ) : (
    <Redirect to={'/login'} />
  )
}

export default SessionExpiryTracker
