import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom/cjs/react-router-dom.min'

import MemberList from './MemberList'

jest.useFakeTimers()
jest.mock('./MemberTable', () => () => 'MemberTable')

let testLocation
const wrapper =
  (initialEntries = '/') =>
  ({ children }) =>
    (
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
  describe('renders user activated status selector', () => {
    describe('default activated status selector', () => {
      it('renders All Users by default', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const allUsers = await screen.findByText('All Users')
        expect(allUsers).toBeInTheDocument()
      })

      it('does not have any location state', () => {
        render(<MemberList />, { wrapper: wrapper() })

        expect(testLocation.state).toBeUndefined()
      })
    })

    describe('selecting All Users', () => {
      it('renders All Users', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const allUsersInitial = await screen.findByText('All Users')
        userEvent.click(allUsersInitial)

        const activeSelect = await screen.findByText('Active')
        userEvent.click(activeSelect)

        const active = await screen.findByText('Active')
        userEvent.click(active)

        const allUsersSelect = await screen.findByText('All Users')
        userEvent.click(allUsersSelect)

        const allUsers = await screen.findByText('All Users')
        expect(allUsers).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const allUsersInitial = await screen.findByText('All Users')
        userEvent.click(allUsersInitial)

        const activeSelect = await screen.findByText('Active')
        userEvent.click(activeSelect)

        const active = await screen.findByText('Active')
        userEvent.click(active)

        const allUsersSelect = await screen.findByText('All Users')
        userEvent.click(allUsersSelect)

        await waitFor(() =>
          expect(testLocation.state.activated).toBeUndefined()
        )
      })
    })

    describe('selecting Active', () => {
      it('renders Active when selected', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const allUsers = await screen.findByText('All Users')
        userEvent.click(allUsers)

        const activeSelect = await screen.findByText('Active')
        userEvent.click(activeSelect)

        const active = await screen.findByText('Active')
        expect(active).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const allUsers = await screen.findByText('All Users')
        userEvent.click(allUsers)

        const activeSelect = await screen.findByText('Active')
        userEvent.click(activeSelect)

        await waitFor(() => expect(testLocation.state.activated).toBeTruthy())
      })
    })

    describe('selecting Non-Active', () => {
      it('renders Non-Active when selected', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const allUsers = await screen.findByText('All Users')
        userEvent.click(allUsers)

        const nonActiveSelect = await screen.findByText('Non-Active')
        userEvent.click(nonActiveSelect)

        const nonActive = await screen.findByText('Non-Active')
        expect(nonActive).toBeInTheDocument()
      })

      it('updates location state', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const allUsers = await screen.findByText('All Users')
        userEvent.click(allUsers)

        const nonActiveSelect = await screen.findByText('Non-Active')
        userEvent.click(nonActiveSelect)

        await waitFor(() => expect(testLocation.state.activated).toBeFalsy())
      })
    })
  })

  describe('renders user role selector', () => {
    describe('default role selector', () => {
      it('renders Everyone by default', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const everyone = await screen.findByText('Everyone')
        expect(everyone).toBeInTheDocument()
      })

      it('does not have any location state', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        expect(testLocation.state).toBeUndefined()
      })
    })

    describe('selecting Everyone', () => {
      it('renders Everyone when selected', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const everyoneInitial = await screen.findByText('Everyone')
        userEvent.click(everyoneInitial)

        const adminSelect = await screen.findByText('Admins')
        userEvent.click(adminSelect)

        const admin = await screen.findByText('Admins')
        userEvent.click(admin)

        const everyoneSelect = await screen.findByText('Everyone')
        userEvent.click(everyoneSelect)

        const everyone = await screen.findByText('Everyone')
        expect(everyone).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const everyoneInitial = await screen.findByText('Everyone')
        userEvent.click(everyoneInitial)

        const adminSelect = await screen.findByText('Admins')
        userEvent.click(adminSelect)

        await waitFor(() => expect(testLocation.state.isAdmin).toBeTruthy())

        const admin = await screen.findByText('Admins')
        userEvent.click(admin)

        const everyoneSelect = await screen.findByText('Everyone')
        userEvent.click(everyoneSelect)

        await waitFor(() => expect(testLocation.state.isAdmin).toBeUndefined())
      })
    })

    describe('selecting Admins', () => {
      it('renders Admin when selected', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const everyone = await screen.findByText('Everyone')
        userEvent.click(everyone)

        const adminSelect = await screen.findByText('Admins')
        userEvent.click(adminSelect)

        const admin = await screen.findByText('Admins')
        expect(admin).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const everyone = await screen.findByText('Everyone')
        userEvent.click(everyone)

        const adminSelect = await screen.findByText('Admins')
        userEvent.click(adminSelect)

        await waitFor(() => expect(testLocation.state.isAdmin).toBeTruthy())
      })
    })

    describe('selecting Developers', () => {
      it('renders Developers when selected', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const everyone = await screen.findByText('Everyone')
        userEvent.click(everyone)

        const developersSelect = await screen.findByText('Developers')
        userEvent.click(developersSelect)

        const developers = await screen.findByText('Developers')
        expect(developers).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        const everyone = await screen.findByText('Everyone')
        userEvent.click(everyone)

        const developersSelect = await screen.findByText('Developers')
        userEvent.click(developersSelect)

        await waitFor(() => expect(testLocation.state.isAdmin).toBeFalsy())
      })
    })
  })

  describe('renders search input', () => {
    it('displays the search box', async () => {
      render(<MemberList />, { wrapper: wrapper() })

      const search = await screen.findByTestId('search-input-members')
      expect(search).toBeInTheDocument()
    })

    describe('when the user types', () => {
      it('updates the text box', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        let search = await screen.findByTestId('search-input-members')

        userEvent.type(search, 'codecov')

        search = await screen.findByTestId('search-input-members')
        expect(search).toHaveAttribute('value', 'codecov')
      })

      it('updates the location params', async () => {
        render(<MemberList />, { wrapper: wrapper() })

        let search = await screen.findByTestId('search-input-members')

        userEvent.type(search, 'codecov')

        jest.advanceTimersByTime(1000)

        expect(testLocation.state.search).toBe('codecov')
      })
    })
  })

  describe('renders MemberTable', () => {
    it('renders MemberTable', async () => {
      render(<MemberList />, { wrapper: wrapper() })

      const table = await screen.findByText('MemberTable')
      expect(table).toBeInTheDocument()
    })
  })
})
