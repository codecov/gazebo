import * as React from 'react'
import noop from 'lodash/noop'

const ToastContext = React.createContext({
  addNofitication: noop,
  removeNotification: noop,
  notifications: [],
})

export function ToastNotificationProvider({ children }) {
  const [notifications, setNotifications] = React.useState([])
  const currentId = React.useRef(0)

  function addNofitication(newNotification) {
    currentId.current++

    const baseNotification = {
      id: currentId.current,
      type: 'success',
      text: 'enter the text',
      disappearAfter: 5000,
    }

    const mergedNotification = {
      ...baseNotification,
      ...newNotification,
    }

    setNotifications((oldNotifications) => [
      ...oldNotifications,
      mergedNotification,
    ])
  }

  function removeNotification(id) {
    setNotifications((oldNotifications) => {
      return oldNotifications.filter((notification) => notification.id !== id)
    })
  }

  const contextValue = {
    notifications,
    addNofitication,
    removeNotification,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}

export function useNotifications() {
  return React.useContext(ToastContext).notifications
}

export function useAddNotification() {
  return React.useContext(ToastContext).addNofitication
}

export function useRemoveNotification() {
  return React.useContext(ToastContext).removeNotification
}
