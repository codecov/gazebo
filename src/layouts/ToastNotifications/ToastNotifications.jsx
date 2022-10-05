import {
  useNotifications,
  useRemoveNotification,
} from 'services/toastNotification'

import NotificationItem from './NotificationItem'

function ToastNotifications() {
  const removeNotification = useRemoveNotification()
  const notifications = useNotifications()

  return (
    <div className="fixed bottom-0 flex justify-center flex-col w-full pb-8">
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
