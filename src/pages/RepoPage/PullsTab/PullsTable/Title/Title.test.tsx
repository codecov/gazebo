import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { formatTimeToNow } from 'shared/utils/dates'

import Title from './Title'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/owner/repo/pulls/9']}>
    <Route path="/:provider/:owner/:repo/pulls/:pullid">{children}</Route>
  </MemoryRouter>
)

describe('Title', () => {
  describe('when rendered', () => {
    it('renders pull title', () => {
      render(
        <Title
          author={{
            username: 'codecov-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
          pullId={746}
          title="Test1"
          updatestamp="2021-08-30T19:33:49.819672"
        />,
        { wrapper }
      )

      const text = screen.getByRole('link', { name: 'Test1' })
      expect(text).toBeInTheDocument()
      expect(text).toHaveAttribute('href', '/gh/owner/repo/pull/746')
    })

    it('renders pull author', () => {
      render(
        <Title
          author={{
            username: 'codecov-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
          pullId={746}
          title="Test1"
          updatestamp="2021-08-30T19:33:49.819672"
        />,
        { wrapper }
      )

      const author1 = screen.getByText(/codecov-user/)
      expect(author1).toBeInTheDocument()
    })

    it('renders pull updatestamp', () => {
      render(
        <Title
          author={{
            username: 'codecov-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
          pullId={746}
          title="Test1"
          updatestamp="2021-08-30T19:33:49.819672"
        />,
        { wrapper }
      )

      const dt = formatTimeToNow('2021-08-30T19:33:49.819672')
      const dt1 = screen.getByText('last updated ' + dt)
      expect(dt1).toBeInTheDocument()
    })
  })

  describe('when rendered for first pull request', () => {
    it('renders pull title', () => {
      render(
        <Title
          author={{
            username: 'codecov-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
          pullId={746}
          title="Test1"
          updatestamp="2021-08-30T19:33:49.819672"
          compareWithBaseType="FirstPullRequest"
        />,
        { wrapper }
      )

      const text = screen.getByRole('link', { name: 'Test1' })
      expect(text).toBeInTheDocument()
      expect(text).toHaveAttribute('href', '/gh/owner/repo/pull/746/tree')
    })
  })
})
