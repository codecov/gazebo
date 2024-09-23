import { render, screen, waitFor } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import TokenRequiredModal from './TokenRequiredModal'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/some-initial-path']}>
    <Route path="/some-initial-path">{children}</Route>
  </MemoryRouter>
)

describe('TokenRequiredModal', () => {
  function setup() {
    return {
      user: userEvent.setup(),
      closeModal: jest.fn(),
      setTokenRequired: jest.fn(),
    }
  }

  describe('renders the modal content correctly', () => {
    it('renders the correct modal title', async () => {
      const { closeModal, setTokenRequired } = setup()

      render(
        <TokenRequiredModal
          closeModal={closeModal}
          setTokenRequired={setTokenRequired}
          isLoading={false}
        />,
        { wrapper }
      )

      const title = await screen.findByText(/Require token for uploads/)
      expect(title).toBeInTheDocument()
    })

    it('renders the correct body content part 1', async () => {
      const { closeModal, setTokenRequired } = setup()

      render(
        <TokenRequiredModal
          closeModal={closeModal}
          setTokenRequired={setTokenRequired}
          isLoading={false}
        />,
        { wrapper }
      )

      const messagePartOne = await screen.findByText(
        /Enforcing token authentication for uploads/
      )
      expect(messagePartOne).toBeInTheDocument()
    })

    it('renders the correct body content part 2', async () => {
      const { closeModal, setTokenRequired } = setup()

      render(
        <TokenRequiredModal
          closeModal={closeModal}
          setTokenRequired={setTokenRequired}
          isLoading={false}
        />,
        { wrapper }
      )

      const messagePartTwo = await screen.findByText(
        /Before proceeding, make sure all of your repositories/
      )
      expect(messagePartTwo).toBeInTheDocument()
    })

    it('renders the correct body content part 3', async () => {
      const { closeModal, setTokenRequired } = setup()

      render(
        <TokenRequiredModal
          closeModal={closeModal}
          setTokenRequired={setTokenRequired}
          isLoading={false}
        />,
        { wrapper }
      )

      const messagePartThree = await screen.findByText(
        /to enforce the use of the global token for uploads./
      )
      expect(messagePartThree).toBeInTheDocument()
    })

    it('renders the cancel button', async () => {
      const { closeModal, setTokenRequired } = setup()

      render(
        <TokenRequiredModal
          closeModal={closeModal}
          setTokenRequired={setTokenRequired}
          isLoading={false}
        />,
        { wrapper }
      )

      const cancelButton = await screen.findByRole('button', { name: /Cancel/ })
      expect(cancelButton).toBeInTheDocument()
    })

    it('renders the require token button', async () => {
      const { closeModal, setTokenRequired } = setup()

      render(
        <TokenRequiredModal
          closeModal={closeModal}
          setTokenRequired={setTokenRequired}
          isLoading={false}
        />,
        { wrapper }
      )

      const requireButton = await screen.findByRole('button', {
        name: /Require token for upload/,
      })
      expect(requireButton).toBeInTheDocument()
    })

    it('renders loading state on require token button', async () => {
      const { closeModal, setTokenRequired } = setup()

      render(
        <TokenRequiredModal
          closeModal={closeModal}
          setTokenRequired={setTokenRequired}
          isLoading={true}
        />,
        { wrapper }
      )

      const requireButton = await screen.findByRole('button', {
        name: /Require token for upload/,
      })
      expect(requireButton).toHaveAttribute('disabled')
    })
  })

  describe('when clicking cancel button', () => {
    it('closes the modal without requiring token', async () => {
      const { user, closeModal, setTokenRequired } = setup()

      render(
        <TokenRequiredModal
          closeModal={closeModal}
          setTokenRequired={setTokenRequired}
          isLoading={false}
        />,
        { wrapper }
      )

      const cancelButton = await screen.findByRole('button', { name: /Cancel/ })
      await user.click(cancelButton)

      expect(setTokenRequired).toHaveBeenCalledWith(false)
      await waitFor(() => expect(closeModal).toHaveBeenCalled())
    })
  })

  describe('when clicking require token button', () => {
    it('sets token requirement and closes the modal', async () => {
      const { user, closeModal, setTokenRequired } = setup()

      render(
        <TokenRequiredModal
          closeModal={closeModal}
          setTokenRequired={setTokenRequired}
          isLoading={false}
        />,
        { wrapper }
      )

      const requireButton = await screen.findByRole('button', {
        name: /Require token for upload/,
      })
      await user.click(requireButton)

      expect(setTokenRequired).toHaveBeenCalledWith(true)
      await waitFor(() => expect(closeModal).toHaveBeenCalled())
    })
  })
})
