import SuccessModal from './SuccessModal'
import { render, screen } from 'custom-testing-library'
import userEvent from '@testing-library/user-event'

describe('SuccessModal', () => {
  const closeModal = jest.fn()
  const defaultProps = {
    owner: 'gh',
    isOpen: true,
    closeModal: closeModal,
  }

  function setup(props) {
    const _props = { ...defaultProps, ...props }
    render(<SuccessModal {..._props} />)
  }

  describe('renders initial SuccessModal', () => {
    beforeEach(() => {
      setup({ owner: 'doggo' })
    })
    it('renders title', () => {
      const title = screen.getByText(/Yaml configuration updated/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const label = screen.getByText(
        /doggo yaml configuration has been successfully saved. New coverage reports will reflect these changes. Repositories with a codecov.yaml file extend this account level Codecov config./
      )
      expect(label).toBeInTheDocument()
    })
    it('renders footer', () => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('closes on done click', () => {
      userEvent.click(screen.getByText('Done'))
      expect(closeModal).toHaveBeenCalled()
    })

    it('closes on X click', () => {
      userEvent.click(screen.getByText('x.svg'))
      expect(closeModal).toHaveBeenCalled()
    })
  })
})
