import { render, screen } from '@testing-library/react'

import {
  useNotifications,
  useRemoveNotification,
} from 'services/toastNotification'

import ToastNotifications from './ToastNotifications'

const notifications = [
  {
    id: 1,
    type: 'success',
    text: 'never disappear',
    disappearAfter: 0,
  },
  {
    id: 2,
    type: 'error',
    text: 'normal disappearing',
    disappearAfter: 5000,
  },
]

jest.mock('services/toastNotification')

describe('ToastNotifications', () => {
  const removeNotification = jest.fn()

  function setup() {
    useNotifications.mockReturnValue(notifications)
    useRemoveNotification.mockReturnValue(removeNotification)
    render(<ToastNotifications />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      removeNotification.mockReset()
      setup()
    })

    it('renders the notifications', () => {
      expect(screen.getByText(notifications[0].text)).toBeInTheDocument()
      expect(screen.getByText(notifications[1].text)).toBeInTheDocument()
    })

    describe('when enough time passes', () => {
      beforeEach(() => {
        jest.runOnlyPendingTimers()
      })

      it('calls removeNotification with the notification that disappear', () => {
        expect(removeNotification).toHaveBeenCalledWith(notifications[1].id)
      })
    })
  })
})
