import Cookies from 'js-cookie'
import React, { useCallback, useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'

const ONE_MINUTE_MILLIS = 60 * 1000
const TWO_MINUTES_MILLIS = 2 * ONE_MINUTE_MILLIS
const THIRTY_MINUTES_MILLIS = 30 * ONE_MINUTE_MILLIS
const LOCAL_STORAGE_SESSION_EXPIRED_KEY = 'expired-session'

const SessionExpiryTracker: React.FC = () => {
  const [redirectToLogout, setRedirectToLogout] = useState(false)
  const sessionExpiryTimeString = Cookies.get('session_expiry')
  localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRED_KEY)
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
      return window.setInterval(
        () => checkSession(sessionExpiryTime),
        ONE_MINUTE_MILLIS
      )
    },
    [checkSession]
  )

  useEffect(() => {
    if (!sessionExpiryTimeString) {
      return
    }
    const sessionExpiryTime = new Date()

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

  const { signOut } = useNavLinks()

  if (!sessionExpiryTimeString || !redirectToLogout) {
    return null
  }

  localStorage.setItem(LOCAL_STORAGE_SESSION_EXPIRED_KEY, 'true')
  const signOutRedirect = signOut.path()

  return <Redirect to={signOutRedirect} />
}

export default SessionExpiryTracker
