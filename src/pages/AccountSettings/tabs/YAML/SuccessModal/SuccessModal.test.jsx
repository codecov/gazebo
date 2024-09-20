import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import SuccessModal from './SuccessModal'

describe('SuccessModal', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }
  describe('renders initial SuccessModal', () => {
    it('renders title', () => {
      const closeModal = vi.fn()
      render(
        <SuccessModal owner="doggo" isOpen={true} closeModal={closeModal} />
      )

      const title = screen.getByText(/YAML configuration updated/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      const closeModal = vi.fn()
      render(
        <SuccessModal owner="doggo" isOpen={true} closeModal={closeModal} />
      )

      const label = screen.getByText(
        /doggo YAML configuration has been successfully saved. New coverage reports will reflect these changes. Repositories with a codecov.yaml file extend and override this account level Codecov config/
      )
      expect(label).toBeInTheDocument()
    })

    it('renders footer', () => {
      const closeModal = vi.fn()
      render(
        <SuccessModal owner="doggo" isOpen={true} closeModal={closeModal} />
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('closes on done click', async () => {
      const { user } = setup()
      const closeModal = vi.fn()
      render(
        <SuccessModal owner="doggo" isOpen={true} closeModal={closeModal} />
      )

      await user.click(screen.getByText('Done'))
      expect(closeModal).toHaveBeenCalled()
    })

    it('closes on X click', async () => {
      const { user } = setup()
      const closeModal = vi.fn()
      render(
        <SuccessModal owner="doggo" isOpen={true} closeModal={closeModal} />
      )

      await user.click(screen.getByTestId('modal-close-icon'))
      expect(closeModal).toHaveBeenCalled()
    })
  })
})
