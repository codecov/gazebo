import {
  useNotifications,
  useRemoveNotification,
} from 'services/toastNotification/context'

import NotificationItem from './NotificationItem'

function ToastNotifications() {
  const removeNotification = useRemoveNotification()
  const notifications = useNotifications()

  return (
    <div className="fixed bottom-0 flex w-full flex-col justify-center pb-8">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          removeNotification={removeNotification}
          notification={notification}
        />
      ))}
    </div>
  )
}

export default ToastNotifications
