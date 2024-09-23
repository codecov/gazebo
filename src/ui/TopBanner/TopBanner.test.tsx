import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type Mock } from 'vitest'

import { TopBanner, useTopBannerContext } from './TopBanner'

describe('TopBanner', () => {
  function setup() {
    const user = userEvent.setup()
    const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')

    return {
      user,
      mockSetItem,
      mockGetItem,
    }
  }

  describe('rendering base banner with only content', () => {
    describe('default variant', () => {
      it('has the correct background color', () => {
        render(
          <TopBanner localStorageKey="testing-key">
            <TopBanner.Start>Test warning banner</TopBanner.Start>
          </TopBanner>
        )

        const div = screen.getByTestId('top-banner-root')
        expect(div).toBeInTheDocument()
        expect(div).toHaveClass('bg-ds-gray-primary')
      })

      it('renders circle exclamation icon when icon component is rendered', () => {
        render(
          <TopBanner localStorageKey="testing-key">
            <TopBanner.Start>Test default banner</TopBanner.Start>
            <TopBanner.IconSymbol />
          </TopBanner>
        )

        const icon = screen.getByTestId('exclamationCircle')
        expect(icon).toBeInTheDocument()
      })

      it('renders text content', () => {
        render(
          <TopBanner localStorageKey="testing-key">
            <TopBanner.Start>Test default banner</TopBanner.Start>
          </TopBanner>
        )

        const text = screen.getByText('Test default banner')
        expect(text).toBeInTheDocument()
      })
    })

    describe('warning variant', () => {
      it('has the correct background color', () => {
        render(
          <TopBanner variant="warning" localStorageKey="testing-key">
            <TopBanner.Start>Test warning banner</TopBanner.Start>
          </TopBanner>
        )

        const div = screen.getByTestId('top-banner-root')
        expect(div).toBeInTheDocument()
        expect(div).toHaveClass('bg-orange-100')
      })

      it('renders triangle exclamation icon', () => {
        render(
          <TopBanner variant="warning" localStorageKey="testing-key">
            <TopBanner.Start>Test warning banner</TopBanner.Start>
            <TopBanner.IconSymbol />
          </TopBanner>
        )

        const icon = screen.getByTestId('exclamationTriangle')
        expect(icon).toBeInTheDocument()
      })

      it('renders text content', () => {
        render(
          <TopBanner variant="warning" localStorageKey="testing-key">
            <TopBanner.Start>Test warning banner</TopBanner.Start>
          </TopBanner>
        )

        const textContent = screen.getByText('Test warning banner')
        expect(textContent).toBeInTheDocument()
      })
    })
  })

  describe('banner display is set to false in local storage', () => {
    it('does not display the banner', () => {
      const { mockGetItem } = setup()

      mockGetItem.mockReturnValue(
        JSON.stringify({ 'testing-dismissed-banner': 'true' })
      )

      const { container } = render(
        <TopBanner localStorageKey="testing-dismissed-banner">
          <TopBanner.Start>Test default banner</TopBanner.Start>
        </TopBanner>
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('user dismisses banner', () => {
    it('hides the current banner', async () => {
      const { mockGetItem, user } = setup()

      mockGetItem.mockReturnValue(null)

      const { container } = render(
        <TopBanner localStorageKey="testing-initial-dismiss-banner">
          <TopBanner.Start>Test default banner</TopBanner.Start>
          <TopBanner.End>
            <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
          </TopBanner.End>
        </TopBanner>
      )

      expect(container).not.toBeEmptyDOMElement()

      const button = screen.getByRole('button', { name: 'Dismiss' })
      await user.click(button)

      expect(container).toBeEmptyDOMElement()
    })

    describe('there are no other dismissed banners', () => {
      it('sets base local store value', async () => {
        const { mockGetItem, mockSetItem, user } = setup()

        mockGetItem.mockReturnValue(null)

        render(
          <TopBanner localStorageKey="testing-initial-dismiss-banner">
            <TopBanner.Start>Test default banner</TopBanner.Start>
            <TopBanner.End>
              <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
            </TopBanner.End>
          </TopBanner>
        )

        const button = screen.getByRole('button', { name: 'Dismiss' })
        await user.click(button)

        await waitFor(() =>
          expect(mockSetItem).toHaveBeenCalledWith(
            'dismissed-top-banners',
            JSON.stringify({ 'testing-initial-dismiss-banner': 'true' })
          )
        )
      })
    })

    describe('another banner has already been dismissed', () => {
      it('appends new banner to local store', async () => {
        const { mockGetItem, mockSetItem, user } = setup()

        mockGetItem.mockReturnValue(
          JSON.stringify({ 'testing-initial-dismiss-banner': 'true' })
        )

        render(
          <TopBanner localStorageKey="testing-second-dismiss-banner">
            <TopBanner.Start>Test default banner</TopBanner.Start>
            <TopBanner.End>
              <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
            </TopBanner.End>
          </TopBanner>
        )

        const button = screen.getByRole('button', { name: 'Dismiss' })
        await user.click(button)

        await waitFor(() =>
          expect(mockSetItem).toHaveBeenCalledWith(
            'dismissed-top-banners',
            JSON.stringify({
              'testing-initial-dismiss-banner': 'true',
              'testing-second-dismiss-banner': 'true',
            })
          )
        )
      })
    })
  })
})

describe('useTopBannerContext', () => {
  describe('when used outside of context', () => {
    let errorMock: Mock

    beforeEach(() => {
      const spy = vi.spyOn(console, 'error')
      errorMock = vi.fn()
      spy.mockImplementation(errorMock)
    })

    afterEach(() => {
      errorMock.mockReset()
    })

    it('throws an error', () => {
      let error

      try {
        renderHook(() => useTopBannerContext())
      } catch (e) {
        error = e as Error
      }
      expect(error?.message).toBe(
        'useTopBannerContext has to be used within `<TopBannerContext.Provider>`'
      )
    })
  })
})
