import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom/cjs/react-router-dom.min'

import MemberList from './MemberList'

jest.useFakeTimers()
jest.mock('./MemberTable', () => () => 'MemberTable')

describe('MemberList', () => {
  let testLocation
  function setup() {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Route path="/">
          <MemberList />
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    )
  }

  describe('renders user activated status selector', () => {
    beforeEach(() => {
      setup()
    })

    describe('default activated status selector', () => {
      it('renders All Users by default', async () => {
        const allUsers = await screen.findByText('All Users')
        expect(allUsers).toBeInTheDocument()
      })

      it('does not have any location state', () => {
        expect(testLocation.state).toBeUndefined()
      })
    })

    describe('selecting All Users', () => {
      it('renders All Users', async () => {
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
        const allUsersInitial = await screen.findByText('All Users')
        userEvent.click(allUsersInitial)

        const activeSelect = await screen.findByText('Active')
        userEvent.click(activeSelect)

        const active = await screen.findByText('Active')
        userEvent.click(active)

        const allUsersSelect = await screen.findByText('All Users')
        userEvent.click(allUsersSelect)

        expect(testLocation.state.activated).toBeUndefined()
      })
    })

    describe('selecting Active', () => {
      it('renders Active when selected', async () => {
        const allUsers = await screen.findByText('All Users')
        userEvent.click(allUsers)

        const activeSelect = await screen.findByText('Active')
        userEvent.click(activeSelect)

        const active = await screen.findByText('Active')
        expect(active).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        const allUsers = await screen.findByText('All Users')
        userEvent.click(allUsers)

        const activeSelect = await screen.findByText('Active')
        userEvent.click(activeSelect)
        expect(testLocation.state.activated).toBeTruthy()
      })
    })

    describe('selecting Non-Active', () => {
      it('renders Non-Active when selected', async () => {
        const allUsers = await screen.findByText('All Users')
        userEvent.click(allUsers)

        const nonActiveSelect = await screen.findByText('Non-Active')
        userEvent.click(nonActiveSelect)

        const nonActive = await screen.findByText('Non-Active')
        expect(nonActive).toBeInTheDocument()
      })

      it('updates location state', async () => {
        const allUsers = await screen.findByText('All Users')
        userEvent.click(allUsers)

        const nonActiveSelect = await screen.findByText('Non-Active')
        userEvent.click(nonActiveSelect)

        expect(testLocation.state.activated).toBeFalsy()
      })
    })
  })

  describe('renders user role selector', () => {
    beforeEach(() => {
      setup()
    })

    describe('default role selector', () => {
      it('renders Everyone by default', async () => {
        const everyone = await screen.findByText('Everyone')
        expect(everyone).toBeInTheDocument()
      })

      it('does not have any location state', async () => {
        expect(testLocation.state).toBeUndefined()
      })
    })

    describe('selecting Everyone', () => {
      it('renders Everyone when selected', async () => {
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
        const everyoneInitial = await screen.findByText('Everyone')
        userEvent.click(everyoneInitial)

        const adminSelect = await screen.findByText('Admins')
        userEvent.click(adminSelect)

        expect(testLocation.state.isAdmin).toBeTruthy()

        const admin = await screen.findByText('Admins')
        userEvent.click(admin)

        const everyoneSelect = await screen.findByText('Everyone')
        userEvent.click(everyoneSelect)

        expect(testLocation.state.isAdmin).toBeUndefined()
      })
    })

    describe('selecting Admins', () => {
      it('renders Admin when selected', async () => {
        const everyone = await screen.findByText('Everyone')
        userEvent.click(everyone)

        const adminSelect = await screen.findByText('Admins')
        userEvent.click(adminSelect)

        const admin = await screen.findByText('Admins')
        expect(admin).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        const everyone = await screen.findByText('Everyone')
        userEvent.click(everyone)

        const adminSelect = await screen.findByText('Admins')
        userEvent.click(adminSelect)

        expect(testLocation.state.isAdmin).toBeTruthy()
      })
    })

    describe('selecting Developers', () => {
      it('renders Developers when selected', async () => {
        const everyone = await screen.findByText('Everyone')
        userEvent.click(everyone)

        const developersSelect = await screen.findByText('Developers')
        userEvent.click(developersSelect)

        const developers = await screen.findByText('Developers')
        expect(developers).toBeInTheDocument()
      })

      it('updates the location state', async () => {
        const everyone = await screen.findByText('Everyone')
        userEvent.click(everyone)

        const developersSelect = await screen.findByText('Developers')
        userEvent.click(developersSelect)

        expect(testLocation.state.isAdmin).toBeFalsy()
      })
    })
  })

  describe('renders search input', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the search box', async () => {
      const search = await screen.findByPlaceholderText('Search')
      expect(search).toBeInTheDocument()
    })

    describe('when the user types', () => {
      it('updates the text box', async () => {
        let search = await screen.findByPlaceholderText('Search')

        userEvent.type(search, 'codecov')

        search = await screen.findByPlaceholderText('Search')
        expect(search).toHaveAttribute('value', 'codecov')
      })

      it('updates the location params', async () => {
        let search = await screen.findByPlaceholderText('Search')

        userEvent.type(search, 'codecov')

        jest.advanceTimersByTime(1000)

        expect(testLocation.state.search).toBe('codecov')
      })
    })
  })

  describe('renders MemberTable', () => {
    beforeEach(() => {
      setup()
    })

    it('renders MemberTable', async () => {
      const table = await screen.findByText('MemberTable')
      expect(table).toBeInTheDocument()
    })
  })
})
