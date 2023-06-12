import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import NoReposBlock from './NoReposBlock'

const wrapper =
  (initialEntries = ['/gl/codecov']) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner">{children}</Route>
      </MemoryRouter>
    )

describe('NoReposBlock', () => {
  describe('when rendered without private access', () => {
    it('renders no repo detected text', async () => {
      const props = { privateAccess: false, searchValue: '' }
      render(<NoReposBlock {...props} />, {
        wrapper: wrapper(),
      })

      const noReposDetected = await screen.findByText(
        /There are no repos detected/
      )
      expect(noReposDetected).toBeInTheDocument()
    })

    it('renders private scope text if it is not github', async () => {
      const props = { privateAccess: false, searchValue: '' }
      render(<NoReposBlock {...props} />, {
        wrapper: wrapper(),
      })

      const privateScopeButton = await screen.findByText(/private scope/)
      expect(privateScopeButton).toBeInTheDocument()
      expect(privateScopeButton).toHaveAttribute(
        'href',
        'https://stage-web.codecov.dev/login/gl?private=true'
      )

      const privateScopeText = await screen.findByText(
        /for access to private repos/
      )
      expect(privateScopeText).toBeInTheDocument()
    })

    it('does not render search prompt', () => {
      const props = { privateAccess: false, searchValue: '' }
      render(<NoReposBlock {...props} />, {
        wrapper: wrapper(),
      })

      const searchNotFoundText = screen.queryByText('No results found')
      expect(searchNotFoundText).not.toBeInTheDocument()
    })
  })

  describe('when rendered with private access', () => {
    it('renders no repo detected text', async () => {
      const props = { privateAccess: true, searchValue: '' }
      render(<NoReposBlock {...props} />, {
        wrapper: wrapper(),
      })

      const noReposDetected = await screen.findByText(
        /There are no repos detected/
      )
      expect(noReposDetected).toBeInTheDocument()
    })

    it('does not render private scope text', () => {
      const props = { privateAccess: true, searchValue: '' }
      render(<NoReposBlock {...props} />, {
        wrapper: wrapper(),
      })

      const privateScopeButton = screen.queryByText(/private scope/)
      expect(privateScopeButton).not.toBeInTheDocument()

      const privateScopeText = screen.queryByText(/for access to private repos/)
      expect(privateScopeText).not.toBeInTheDocument()
    })

    it('does not render search prompt', () => {
      const props = { privateAccess: true, searchValue: '' }
      render(<NoReposBlock {...props} />, {
        wrapper: wrapper(),
      })

      const searchNotFoundText = screen.queryByText('No results found')
      expect(searchNotFoundText).not.toBeInTheDocument()
    })
  })

  describe('when rendered with search value', () => {
    it('renders search prompt', async () => {
      const props = { privateAccess: true, searchValue: 'asff' }
      render(<NoReposBlock {...props} />, {
        wrapper: wrapper(),
      })

      const searchNotFoundText = await screen.findByText('No results found')
      expect(searchNotFoundText).toBeInTheDocument()
    })

    it('does not render no repo detected text', () => {
      const props = { privateAccess: true, searchValue: 'asff' }
      render(<NoReposBlock {...props} />, {
        wrapper: wrapper(),
      })

      const noReposDetected = screen.queryByText(/There are no repos detected/)
      expect(noReposDetected).not.toBeInTheDocument()
    })

    it('does not render private scope text', () => {
      const props = { privateAccess: true, searchValue: 'asff' }
      render(<NoReposBlock {...props} />, {
        wrapper: wrapper(),
      })

      const privateScopeButton = screen.queryByText(/private scope/)
      expect(privateScopeButton).not.toBeInTheDocument()

      const privateScopeText = screen.queryByText(/for access to private repos/)
      expect(privateScopeText).not.toBeInTheDocument()
    })
  })
})
