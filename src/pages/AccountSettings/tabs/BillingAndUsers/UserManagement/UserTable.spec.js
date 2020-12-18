import { render, screen } from '@testing-library/react'
import UserTable from './UserTable'

const users = [
  {
    activated: false,
    is_admin: false,
    username: 'TerrySmithDC',
    email: 'terry@codecov.io',
    ownerid: 2,
    student: false,
    name: 'Terry Smith',
    latest_private_pr_date: '2020-12-10T17:25:50.141532Z',
    lastseen: '2020-12-17T17:25:50.141532Z',
  },
]

describe('UserTable', () => {
  function setup() {
    render(
      <UserTable
        users={users}
        provider="gh"
        Cta={({ username }) => (
          <div>
            PassedComponent. Current user is passed to props: {username}
          </div>
        )}
      />
    )
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the users name', () => {
      const name = screen.getByText(users[0].name)
      expect(name).toBeInTheDocument()
    })

    it('renders the users username', () => {
      const username = screen.getByText(`@${users[0].username}`, {
        exact: false, // Line break issues
      })
      expect(username).toBeInTheDocument()
    })

    it('renders the users email', () => {
      const email = screen.getByText(users[0].email)
      expect(email).toBeInTheDocument()
    })

    it('renders the users last pr', () => {
      const lastPr = screen.getByText('Last PR: 12/10/02020')
      expect(lastPr).toBeInTheDocument()
    })

    it('renders the users last seen', () => {
      const lastseen = screen.getByText('Last Seen: 12/17/02020')
      expect(lastseen).toBeInTheDocument()
    })
  })
})
