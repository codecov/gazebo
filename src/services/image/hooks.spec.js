import { renderHook } from '@testing-library/react-hooks'

import { useImage } from './hooks'

describe('useImage', () => {
  let hookData
  it('starts loading an image', () => {
    hookData = renderHook(() => useImage({ src: 'image.com' }))

    expect(hookData.result.current.isLoading).toBeTruthy()
  })
  it('successfully loads an image', () => {
    hookData = renderHook(() => useImage({ src: 'image.com' }))

    expect(hookData).toEqual({})
  })
  it('cannot successfully load an image', () => {})
})
