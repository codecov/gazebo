import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useLegacyRedirects } from 'services/redirects'
import userEvent from '@testing-library/user-event'
import Header from './Header'

jest.mock('services/redirects/hooks')

describe('Header', () => {
  function setup({ provider, owner, commit, repo }) {
    render(
      <Header provider={provider} owner={owner} commit={commit} repo={repo} />,
      {
        wrapper: MemoryRouter,
      }
    )
  }

  describe('when provider is gh, bb or gl', () => {
    it('Ask for feedback banner is rendered', () => {
      setup({
        provider: 'gh',
        owner: 'little-z',
        repo: 'twist',
        commit: '123',
      })
      expect(
        screen.getByText(
          /Also, we would love to hear your feedback! Let us know what you think in/
        )
      ).toBeInTheDocument()
    })

    it('Anchors show based on provider', () => {
      setup({
        provider: 'gh',
        owner: 'little-z',
        repo: 'twist',
        commit: '123',
      })
      const issueLink = screen.getByRole('link', { name: /this issue/i })
      expect(issueLink).toBeInTheDocument()
      expect(issueLink.href).toBe(
        'https://github.com/codecov/Codecov-user-feedback/issues/1'
      )

      const previousUILink = screen.getByRole('link', {
        name: /switch back to the previous user interface/i,
      })
      expect(previousUILink).toBeInTheDocument()
      expect(previousUILink.href).toBe(
        'https://stage-web.codecov.dev/gh/little-z/twist/commit/123'
      )
    })

    it('Calls the onclick when previous design is chosen', () => {
      setup({
        provider: 'gh',
        owner: 'little-z',
        repo: 'twist',
        commit: '123',
      })
      const switchBackLink = screen.getByRole('link', { name: /switch back/i })
      userEvent.click(switchBackLink)
      expect(useLegacyRedirects).toHaveBeenCalledWith({
        cookieName: 'commit_detail_page',
        pathname: '/gh/little-z/twist/commit/123',
        selectedOldUI: true,
      })
    })
  })
})
