import PropType from 'prop-types'
import { useCallback, useEffect } from 'react'

import Message from 'ui/Message'
import { notificationPropType } from 'services/toastNotification'

function NotificationItem({ notification, removeNotification }) {
  const close = useCallback(() => {
    return removeNotification(notification.id)
  }, [notification.id, removeNotification])

  // remove notification after the delay
  useEffect(() => {
    // infinite notification
    if (notification.disappearAfter === 0) return

    const timeout = setTimeout(close, notification.disappearAfter)

    // cleanup if unmounted before the time
    return () => clearTimeout(timeout)
  }, [close, notification])

  const className = 'rounded-full max-w-lg mx-auto flex items-center mt-4 p-2'

  return (
    <Message className={className} onClose={close} variant={notification.type}>
      {notification.text}
    </Message>
  )
}

NotificationItem.propTypes = {
  notification: notificationPropType.isRequired,
  removeNotification: PropType.func.isRequired,
}

export default NotificationItem
