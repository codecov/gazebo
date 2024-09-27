import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom/cjs/react-router-dom.min'

import MemberList from './MemberList'

vi.mock('./MemberTable', () => ({ default: () => 'MemberTable' }))

let testLocation
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/']}>
    <Route path="/">{children}</Route>
    <Route
      path="*"
      render={({ location }) => {
        testLocation = location
        return null
      }}
    />
  </MemoryRouter>
)

describe('MemberList', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  describe('renders user activated status selector', () => {
    afterEach(() => (testLocation = undefined))

    describe('default activated status selector', () => {
      it('renders All Users by default', async () => {
        render(<MemberList />, { wrapper })

        const allUsers = await screen.findByText('All Users')
        expect(allUsers).toBeInTheDocument()
      })

      it('does not have any location state', () => {
        render(<MemberList />, { wrapper })

        expect(testLocation.state).toBeUndefined()
      })
    })

    describe('selecting All Users', () => {
      it('renders All Users', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const allUsersInitial = await screen.findByText('All Users')
        await user.click(allUsersInitial)

        const activeSelect = await screen.findByText('Active')
        await user.click(activeSelect)

        const active = await screen.findByText('Active')
        await user.click(active)

        const allUsersSelect = await screen.findByText('All Users')
        await user.click(allUsersSelect)

        const allUsers = await screen.findByText('All Users')
        expect(allUsers).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const allUsersInitial = await screen.findByText('All Users')
        await user.click(allUsersInitial)

        const activeSelect = await screen.findByText('Active')
        await user.click(activeSelect)

        const active = await screen.findByText('Active')
        await user.click(active)

        const allUsersSelect = await screen.findByText('All Users')
        await user.click(allUsersSelect)

        await waitFor(() =>
          expect(testLocation.state.activated).toBeUndefined()
        )
      })
    })

    describe('selecting Active', () => {
      it('renders Active when selected', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const allUsers = await screen.findByText('All Users')
        await user.click(allUsers)

        const activeSelect = await screen.findByText('Active')
        await user.click(activeSelect)

        const active = await screen.findByText('Active')
        expect(active).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const allUsers = await screen.findByText('All Users')
        await user.click(allUsers)

        const activeSelect = await screen.findByText('Active')
        await user.click(activeSelect)

        await waitFor(() => expect(testLocation.state.activated).toBeTruthy())
      })
    })

    describe('selecting Non-Active', () => {
      it('renders Non-Active when selected', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const allUsers = await screen.findByText('All Users')
        await user.click(allUsers)

        const nonActiveSelect = await screen.findByText('Non-Active')
        await user.click(nonActiveSelect)

        const nonActive = await screen.findByText('Non-Active')
        expect(nonActive).toBeInTheDocument()
      })

      it('updates location state', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const allUsers = await screen.findByText('All Users')
        await user.click(allUsers)

        const nonActiveSelect = await screen.findByText('Non-Active')
        await user.click(nonActiveSelect)

        expect(testLocation.state.activated).toBeFalsy()
      })
    })
  })

  describe('renders user role selector', () => {
    afterEach(() => (testLocation = undefined))

    describe('default role selector', () => {
      it('renders Everyone by default', async () => {
        render(<MemberList />, { wrapper })

        const everyone = await screen.findByText('Everyone')
        expect(everyone).toBeInTheDocument()
      })

      it('does not have any location state', async () => {
        render(<MemberList />, { wrapper })

        expect(testLocation.state).toBeUndefined()
      })
    })

    describe('selecting Everyone', () => {
      it('renders Everyone when selected', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const everyoneInitial = await screen.findByText('Everyone')
        await user.click(everyoneInitial)

        const adminSelect = await screen.findByText('Admins')
        await user.click(adminSelect)

        const admin = await screen.findByText('Admins')
        await user.click(admin)

        const everyoneSelect = await screen.findByText('Everyone')
        await user.click(everyoneSelect)

        const everyone = await screen.findByText('Everyone')
        expect(everyone).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const everyoneInitial = await screen.findByText('Everyone')
        await user.click(everyoneInitial)

        const adminSelect = await screen.findByText('Admins')
        await user.click(adminSelect)

        expect(testLocation.state.isAdmin).toBeTruthy()

        const admin = await screen.findByText('Admins')
        await user.click(admin)

        const everyoneSelect = await screen.findByText('Everyone')
        await user.click(everyoneSelect)

        expect(testLocation.state.isAdmin).toBeUndefined()
      })
    })

    describe('selecting Admins', () => {
      it('renders Admin when selected', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const everyone = await screen.findByText('Everyone')
        await user.click(everyone)

        const adminSelect = await screen.findByText('Admins')
        await user.click(adminSelect)

        const admin = await screen.findByText('Admins')
        expect(admin).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const everyone = await screen.findByText('Everyone')
        await user.click(everyone)

        const adminSelect = await screen.findByText('Admins')
        await user.click(adminSelect)

        expect(testLocation.state.isAdmin).toBeTruthy()
      })
    })

    describe('selecting Developers', () => {
      it('renders Developers when selected', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const everyone = await screen.findByText('Everyone')
        await user.click(everyone)

        const developersSelect = await screen.findByText('Developers')
        await user.click(developersSelect)

        const developers = await screen.findByText('Developers')
        expect(developers).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        const everyone = await screen.findByText('Everyone')
        await user.click(everyone)

        const developersSelect = await screen.findByText('Developers')
        await user.click(developersSelect)

        expect(testLocation.state.isAdmin).toBeFalsy()
      })
    })
  })

  describe('renders search input', () => {
    afterEach(() => (testLocation = undefined))

    it('displays the search box', async () => {
      render(<MemberList />, { wrapper })

      const search = await screen.findByTestId('search-input-members')
      expect(search).toBeInTheDocument()
    })

    describe('when the user types', () => {
      it('updates the text box', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        let search = await screen.findByTestId('search-input-members')

        await user.type(search, 'codecov')

        search = await screen.findByTestId('search-input-members')
        expect(search).toHaveAttribute('value', 'codecov')
      })

      it('updates the location params', async () => {
        const { user } = setup()
        render(<MemberList />, { wrapper })

        let search = await screen.findByTestId('search-input-members')

        await user.type(search, 'codecov')

        await waitFor(() => expect(testLocation.state.search).toBe('codecov'))
      })
    })
  })

  describe('renders MemberTable', () => {
    afterEach(() => (testLocation = undefined))

    it('renders MemberTable', async () => {
      render(<MemberList />, { wrapper })

      const table = await screen.findByText('MemberTable')
      expect(table).toBeInTheDocument()
    })
  })
})
