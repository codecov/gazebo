import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useEraseRepoContent } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'

import EraseRepoContent from './EraseRepoContent'

jest.mock('services/repo')
jest.mock('services/toastNotification')

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
    <Route path="/:provider/:owner/:repo/settings">{children}</Route>
  </MemoryRouter>
)
describe('EraseRepoContent', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()
    useAddNotification.mockReturnValue(addNotification)
    useEraseRepoContent.mockReturnValue({
      isLoading: false,
      mutate,
    })

    return { user, mutate, addNotification }
  }

  describe('renders EraseRepoContent component', () => {
    beforeEach(() => setup())

    it('renders title', () => {
      render(<EraseRepoContent />, { wrapper })
      const title = screen.getByText(/Erase repo coverage content/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      render(<EraseRepoContent />, { wrapper })

      const p = screen.getByText(
        'This will remove all coverage reporting from the repo.'
      )
      expect(p).toBeInTheDocument()
    })

    it('renders regenerate button', () => {
      render(<EraseRepoContent />, { wrapper })

      expect(
        screen.getByRole('button', { name: 'Erase Content' })
      ).toBeInTheDocument()
    })
  })

  describe('when the user clicks on erase content button', () => {
    it('displays Erase Content Modal', async () => {
      const { user } = setup()
      render(<EraseRepoContent />, { wrapper })

      await user.click(screen.getByRole('button', { name: 'Erase Content' }))

      expect(
        screen.getByText(
          'Are you sure you want to erase the repo coverage content?'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'This will erase repo coverage content should erase all coverage data contained in the repo. This action is irreversible and if you proceed, you will permanently erase any historical code coverage in Codecov for this repository.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Erase Content' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    describe('when user clicks on Cancel button', () => {
      it('does not call the mutation', async () => {
        const { user } = setup()

        const { mutate } = setup()
        render(<EraseRepoContent />, { wrapper })

        await user.click(screen.getByRole('button', { name: 'Erase Content' }))
        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(mutate).not.toHaveBeenCalled()
      })
    })
  })

  describe('when user clicks on Erase Content button', () => {
    it('calls the mutation', async () => {
      const { user, mutate } = setup('new token')
      render(<EraseRepoContent />, { wrapper })
      await userEvent.click(
        screen.getByRole('button', { name: 'Erase Content' })
      )
      await user.click(screen.getByRole('button', { name: 'Erase Content' }))

      expect(mutate).toHaveBeenCalled()
    })
  })

  describe('when mutation is not successful', () => {
    it('calls the mutation', async () => {
      const { user, mutate } = setup('new token')

      render(<EraseRepoContent />, { wrapper })

      await user.click(screen.getByRole('button', { name: 'Erase Content' }))
      await user.click(screen.getByRole('button', { name: 'Erase Content' }))
      mutate.mock.calls[0][1].onError()

      expect(mutate).toHaveBeenCalled()
    })

    it('adds an error notification', async () => {
      const { user, mutate, addNotification } = setup('new token')

      render(<EraseRepoContent />, { wrapper })

      await user.click(screen.getByRole('button', { name: 'Erase Content' }))
      await user.click(screen.getByRole('button', { name: 'Erase Content' }))
      mutate.mock.calls[0][1].onError()

      expect(addNotification).toHaveBeenCalledWith({
        type: 'error',
        text: "We were unable to erase this repo's content",
      })
    })
  })
})
