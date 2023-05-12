import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, useParams } from 'react-router-dom'

import { useResyncUser } from 'services/user'

import RepoOrgNotFound from './RepoOrgNotFound'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(),
}))
jest.mock('services/user')

describe('RepoOrgNotFound', () => {
  function setup(
    provider,
    returnValueResync = {
      isSyncing: false,
    }
  ) {
    const trigger = jest.fn()

    const resyncUser = { triggerResync: trigger, ...returnValueResync }

    useParams.mockReturnValue({ provider })
    useResyncUser.mockReturnValue(resyncUser)

    return { trigger }
  }

  describe('when rendered with gh provider and the sync is not in progress', () => {
    it('renders the button to resync', () => {
      setup('gh')
      render(<RepoOrgNotFound />, { wrapper: MemoryRouter })

      expect(
        screen.getByRole('button', {
          name: /re-sync/i,
        })
      ).toBeInTheDocument()
    })

    it('renders text related to gh provider', () => {
      setup('gh')
      render(<RepoOrgNotFound />, { wrapper: MemoryRouter })

      expect(screen.getByText(/or org?/)).toBeInTheDocument()
      expect(screen.getByText(/check org access/)).toBeInTheDocument()
      expect(screen.getByText(/Learn more in/)).toBeInTheDocument()
    })

    describe('when the user clicks on the button', () => {
      it('calls the triggerResync from the service', async () => {
        const { trigger } = setup('gh')
        const user = userEvent.setup()
        render(<RepoOrgNotFound />, { wrapper: MemoryRouter })

        await user.click(
          screen.getByRole('button', {
            name: /re-sync/i,
          })
        )

        expect(trigger).toHaveBeenCalled()
      })
    })
  })

  describe('when rendered without gh provider and the sync is not in progress', () => {
    beforeEach(() => setup('not-gh'))

    it(`shouldn't render text related to gh provider`, () => {
      render(<RepoOrgNotFound />, { wrapper: MemoryRouter })

      expect(screen.queryByText(/or org?/)).toBeNull()
      expect(screen.queryByText(/check org access/)).toBeNull()
    })
  })

  describe('when the syncing is in progress', () => {
    beforeEach(() => {
      setup('gh', {
        isSyncing: true,
        triggerResync: () => null,
      })
    })

    it('renders a loading message', () => {
      render(<RepoOrgNotFound />, { wrapper: MemoryRouter })

      expect(screen.getByText(/Syncing\.\.\./i)).toBeInTheDocument()
    })

    it('renders rest of the help message', () => {
      render(<RepoOrgNotFound />, { wrapper: MemoryRouter })

      expect(screen.getByText(/check org access/)).toBeInTheDocument()
    })
  })
})
