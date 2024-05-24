import { waitFor } from '@testing-library/react'

import {
  cancelAnimationTimeout,
  requestAnimationTimeout,
} from './animationFrameUtils'

describe('requestAnimationTimeout', () => {
  let requestAnimationFrameSpy: jest.SpyInstance
  let dateNowSpy: jest.SpyInstance

  beforeEach(() => {
    requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')
    dateNowSpy = jest.spyOn(Date, 'now')
  })

  afterEach(() => {
    requestAnimationFrameSpy.mockReset()
    dateNowSpy.mockReset()
    jest.clearAllMocks()
  })

  it('should call the callback after the specified delay', async () => {
    dateNowSpy
      .mockImplementationOnce(() => 1000)
      .mockImplementationOnce(() => 2000)
    requestAnimationFrameSpy.mockImplementation((cb) => {
      setTimeout(() => {
        cb()
      }, 50)
      return 1
    })

    const callback = jest.fn()
    requestAnimationTimeout(callback, 1000)

    await waitFor(() => expect(callback).toHaveBeenCalled())
  })

  it('should not call the callback before the specified delay', async () => {
    dateNowSpy
      .mockImplementationOnce(() => 1000)
      .mockImplementationOnce(() => 1500)
    requestAnimationFrameSpy.mockImplementation((cb) => {
      setTimeout(() => {
        cb()
      }, 50)
      return 1
    })

    const callback = jest.fn()
    requestAnimationTimeout(callback, 1000)

    await waitFor(() =>
      expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(2)
    )

    await waitFor(() => expect(callback).not.toHaveBeenCalled())
  })

  it('early returns if date now is undefined', async () => {
    dateNowSpy.mockImplementation(() => undefined)
    requestAnimationFrameSpy.mockImplementation((cb) => {
      setTimeout(() => {
        cb()
      }, 50)
      return 1
    })

    const callback = jest.fn()
    requestAnimationTimeout(callback, 1000)

    await waitFor(() =>
      expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(3)
    )
  })
})

describe('cancelAnimationTimeout', () => {
  let cancelAnimationFrameSpy: jest.SpyInstance

  beforeEach(() => {
    cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame')
  })

  it('should call window.cancelAnimationFrame', () => {
    const frame = { id: 1 }
    cancelAnimationTimeout(frame)
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(frame.id)
  })
})
