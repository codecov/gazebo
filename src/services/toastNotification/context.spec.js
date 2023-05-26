import { act, renderHook, waitFor } from '@testing-library/react'

import {
  ToastNotificationProvider,
  useAddNotification,
  useNotifications,
  useRemoveNotification,
} from './context'

function useNotificationContexts() {
  return {
    notifications: useNotifications(),
    addNotification: useAddNotification(),
    removeNotification: useRemoveNotification(),
  }
}

describe('ToastNotificationProvider', () => {
  describe('when called', () => {
    it('does not have notifications', () => {
      const { result } = renderHook(() => useNotificationContexts(), {
        wrapper: ToastNotificationProvider,
      })

      expect(result.current.notifications).toHaveLength(0)
    })

    describe('when calling addNotification', () => {
      it('returns the notification', () => {
        let returnValue
        const { result } = renderHook(() => useNotificationContexts(), {
          wrapper: ToastNotificationProvider,
        })

        act(() => {
          returnValue = result.current.addNotification({
            text: 'hello',
          })
        })

        expect(result.current.notifications[0]).toBe(returnValue)
      })

      it('has the right text plus default information', async () => {
        const { result } = renderHook(() => useNotificationContexts(), {
          wrapper: ToastNotificationProvider,
        })

        act(() => {
          result.current.addNotification({
            text: 'hello',
          })
        })

        await waitFor(() =>
          expect(result.current.notifications[0]).toEqual({
            id: expect.any(Number),
            type: 'success',
            text: 'hello',
            disappearAfter: 5000,
          })
        )
      })

      describe('when calling removeNotification', () => {
        it('removes the notification', async () => {
          const { result } = renderHook(() => useNotificationContexts(), {
            wrapper: ToastNotificationProvider,
          })

          await waitFor(() => !!result.current.notifications[0])
          const notification = result.current.notifications[0]

          act(() => {
            result.current.removeNotification(notification?.id)
          })

          expect(result.current.notifications).toHaveLength(0)
        })
      })
    })
  })
})
