import { act, renderHook } from '@testing-library/react-hooks'

import {
  ToastNotificationProvider,
  useAddNotification,
  useNotifications,
  useRemoveNotification,
} from './context'

function useNotificationContexts() {
  return {
    notifications: useNotifications(),
    addNofitication: useAddNotification(),
    removeNotification: useRemoveNotification(),
  }
}

describe('ToastNotificationProvider', () => {
  let hookData

  function setup() {
    hookData = renderHook(() => useNotificationContexts(), {
      wrapper: ToastNotificationProvider,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('doesnt have notifications', () => {
      expect(hookData.result.current.notifications).toHaveLength(0)
    })

    describe('when calling addNofitication', () => {
      let returnValue
      beforeEach(() => {
        act(() => {
          returnValue = hookData.result.current.addNofitication({
            text: 'hello',
          })
        })
      })

      it('returns the notification', () => {
        expect(hookData.result.current.notifications[0]).toBe(returnValue)
      })

      it('has the right text plus default information', () => {
        const notification = hookData.result.current.notifications[0]
        expect(notification).toEqual({
          id: expect.any(Number),
          type: 'success',
          text: 'hello',
          disappearAfter: 5000,
        })
      })

      describe('when calling removeNotification', () => {
        beforeEach(() => {
          const notification = hookData.result.current.notifications[0]
          act(() => {
            hookData.result.current.removeNotification(notification.id)
          })
        })

        it('removes the notification', () => {
          expect(hookData.result.current.notifications).toHaveLength(0)
        })
      })
    })
  })
})
