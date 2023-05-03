import { render, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'

import { TopBanner, useTopBannerContext } from './TopBanner'

describe('TopBanner', () => {
  function setup() {
    const user = userEvent.setup()
    const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

    return {
      user,
      mockSetItem,
      mockGetItem,
    }
  }

  describe('rendering base banner with only content', () => {
    describe('default variant', () => {
      it.skip('has the correct background color', () => {
        expect(2).toBe(1)
      })

      it('renders circle exclamation icon', () => {
        render(
          <TopBanner localStorageKey="testing-key">
            <TopBanner.Content>Test default banner</TopBanner.Content>
          </TopBanner>
        )

        const icon = screen.getByText(/exclamation-circle.svg/)
        expect(icon).toBeInTheDocument()
      })

      it('renders text content', () => {
        render(
          <TopBanner localStorageKey="testing-key">
            <TopBanner.Content>Test default banner</TopBanner.Content>
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
            <TopBanner.Content>Test warning banner</TopBanner.Content>
          </TopBanner>
        )

        const div = screen.getByTestId('top-banner-root')
        expect(div).toBeInTheDocument()
        expect(div).toHaveClass('bg-orange-100')
      })

      it('renders triangle exclamation icon', () => {
        render(
          <TopBanner variant="warning" localStorageKey="testing-key">
            <TopBanner.Content>Test warning banner</TopBanner.Content>
          </TopBanner>
        )

        const icon = screen.getByText(/exclamation-triangle.svg/)
        expect(icon).toBeInTheDocument()
      })

      it('renders text content', () => {
        render(
          <TopBanner variant="warning" localStorageKey="testing-key">
            <TopBanner.Content>Test warning banner</TopBanner.Content>
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
          <TopBanner.Content>Test default banner</TopBanner.Content>
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
          <TopBanner.Content>Test default banner</TopBanner.Content>
          <TopBanner.ButtonGroup>
            <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
          </TopBanner.ButtonGroup>
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
            <TopBanner.Content>Test default banner</TopBanner.Content>
            <TopBanner.ButtonGroup>
              <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
            </TopBanner.ButtonGroup>
          </TopBanner>
        )

        const button = screen.getByRole('button', { name: 'Dismiss' })
        await user.click(button)

        await waitFor(() =>
          expect(mockSetItem).toBeCalledWith(
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
            <TopBanner.Content>Test default banner</TopBanner.Content>
            <TopBanner.ButtonGroup>
              <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
            </TopBanner.ButtonGroup>
          </TopBanner>
        )

        const button = screen.getByRole('button', { name: 'Dismiss' })
        await user.click(button)

        await waitFor(() =>
          expect(mockSetItem).toBeCalledWith(
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
    it('throws an error', () => {
      const { result } = renderHook(() => useTopBannerContext())

      expect(result.error).toStrictEqual(
        Error(
          'useTopBannerContext has to be used within `<TopBannerContext.Provider>`'
        )
      )
    })
  })
})
