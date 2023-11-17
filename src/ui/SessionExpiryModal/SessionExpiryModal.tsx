import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

const ONE_MINUTE_MILLIS = 60 * 1000
const TWO_MINUTES_MILLIS = 2 * ONE_MINUTE_MILLIS
const THIRTY_MINUTES_MILLIS = 30 * ONE_MINUTE_MILLIS

const SessionExpiryModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const sessionExpiryTimeString = Cookies.get('session_expiry')

  const checkSession = (sessionExpiryTime: Date) => {
    const currentTime = new Date()
    const timeLeft = sessionExpiryTime.getTime() - currentTime.getTime()
    if (timeLeft <= TWO_MINUTES_MILLIS) {
      setShowModal(true)
    }
  }

  useEffect(() => {
    if (!sessionExpiryTimeString) {
      return
    }

    const sessionExpiryTime = new Date(sessionExpiryTimeString)
    const timeLeft = sessionExpiryTime.getTime() - new Date().getTime()
    const delayBeforeStart =
      timeLeft > THIRTY_MINUTES_MILLIS ? timeLeft - THIRTY_MINUTES_MILLIS : 0

    const setupSessionIntervalCheck = (sessionExpiryTime: Date) => {
      checkSession(sessionExpiryTime)
      return setInterval(
        () => checkSession(sessionExpiryTime),
        ONE_MINUTE_MILLIS
      )
    }

    let intervalId: NodeJS.Timeout
    const timeoutId = setTimeout(() => {
      intervalId = setupSessionIntervalCheck(sessionExpiryTime)
      checkSession(sessionExpiryTime)
    }, delayBeforeStart)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [sessionExpiryTimeString])

  if (!sessionExpiryTimeString) {
    return null
  }

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {}}
      title="Your session has expired"
      hasCloseButton={false}
      body={
        <Button
          variant="primary"
          hook=""
          disabled={false}
          to={{ pageName: 'signOut' }}
        >
          Please log in again to continue using Codecov
        </Button>
      }
    />
  )
}

export default SessionExpiryModal
