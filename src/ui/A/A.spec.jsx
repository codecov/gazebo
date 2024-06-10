import * as Sentry from '@sentry/react'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import A from '.'

describe('A', () => {
  function setup(props = {}) {
    const user = userEvent.setup()
    render(<A {...props} />, {
      wrapper: MemoryRouter,
    })
    return { user }
  }

  describe('when rendered with the prop `to`', () => {
    it('renders a link with the right URL', () => {
      setup({
        to: {
          pageName: 'account',
          options: {
            provider: 'gh',
            owner: 'spotify',
          },
        },
      })
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/account/gh/spotify'
      )
    })

    it('fires a sentry event on click', async () => {
      const { user } = setup({
        to: {
          pageName: 'account',
          options: {
            provider: 'gh',
            owner: 'spotify',
          },
        },
      })
      const link = screen.getByRole('link')

      await user.click(link)
      await waitFor(() => expect(Sentry.metrics.increment).toHaveBeenCalled())
    })
  })

  describe('when rendered without `to` prop with a hook passed', () => {
    it('renders a A', () => {
      setup({
        children: 'hola',
        href: '/banana',
        hook: 'banana',
      })
      expect(screen.getByRole('link')).toHaveAttribute('href', '/banana')
    })

    it('fires a sentry event on click', async () => {
      const { user } = setup({
        children: 'hola',
        href: '/banana',
        hook: 'banana',
      })

      const link = screen.getByRole('link')

      await user.click(link)
      await waitFor(() => expect(Sentry.metrics.increment).toHaveBeenCalled())
    })
  })

  describe('when rendered without `to` prop', () => {
    let mockError

    beforeEach(() => {
      mockError = jest.fn()
      const spy = jest.spyOn(console, 'error')
      spy.mockImplementation(mockError)

      setup({
        href: '/banana',
      })
    })
    afterEach(() => jest.resetAllMocks())

    it('PropTypes warning is thrown that developers need to provide a hook prop if not using to', () => {
      expect(mockError).toHaveBeenCalledTimes(1)
    })
  })

  describe('when a link is external render icon', () => {
    it('renders a A', () => {
      setup({
        children: 'hola',
        href: '/banana',
        hook: 'banana',
      })
      expect(screen.getByRole('link')).toHaveAttribute('href', '/banana')
    })

    it('adjusts the links owner if it includes gitlab and the owner has a subgroup', () => {
      setup({
        children: 'gitlab bad child',
        href: 'https://gitlab.com/array.com-internal:engineering/monorepo/builds/2329258074',
        hook: 'gitlab-woa',
      })
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://gitlab.com/array.com-internal/engineering/monorepo/builds/2329258074'
      )
    })

    it('adjusts the links owner if it includes gitlab and the owner has many subgroups', () => {
      setup({
        children: 'gitlab bad child',
        href: 'https://gitlab.com/array.com-internal:engineering:another/monorepo/builds/2329258074',
        hook: 'gitlab-woa',
      })
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://gitlab.com/array.com-internal/engineering/another/monorepo/builds/2329258074'
      )
    })

    it('doesnt adjust the link if the link has colons outside the owner', () => {
      setup({
        children: 'gitlab bad child',
        href: 'https://gitlab.com/array.com-internal/monorepo:something/builds/2329258074',
        hook: 'gitlab-woa',
      })
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://gitlab.com/array.com-internal/monorepo:something/builds/2329258074'
      )
    })
  })
})
