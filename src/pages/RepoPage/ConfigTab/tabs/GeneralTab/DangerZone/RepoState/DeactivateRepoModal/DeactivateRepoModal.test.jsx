import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import DeactivateRepoModal from './DeactivateRepoModal'

describe('DeactivateRepoModal component', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }
  describe('renders the component correctly', () => {
    it('renders modal title', () => {
      const closeModalMock = vi.fn()
      const deactivateRepoMock = vi.fn()

      render(
        <DeactivateRepoModal
          closeModal={closeModalMock}
          deactivateRepo={deactivateRepoMock}
          isLoading={false}
          showModal={true}
          activated
        />
      )
      const modalTitle = screen.getByText(
        /Are you sure you want to deactivate the repo\?/
      )
      expect(modalTitle).toBeInTheDocument()
    })

    it('renders modal body', () => {
      const closeModalMock = vi.fn()
      const deactivateRepoMock = vi.fn()

      render(
        <DeactivateRepoModal
          closeModal={closeModalMock}
          deactivateRepo={deactivateRepoMock}
          isLoading={false}
          showModal={true}
          activated
        />
      )
      const modalBody = screen.getByText(
        /Deactivate repo will deactivate a repo and prevent the upload of coverage information to that repo going forward./
      )
      expect(modalBody).toBeInTheDocument()
    })

    it('renders cancel button', () => {
      const closeModalMock = vi.fn()
      const deactivateRepoMock = vi.fn()

      render(
        <DeactivateRepoModal
          closeModal={closeModalMock}
          deactivateRepo={deactivateRepoMock}
          isLoading={false}
          showModal={true}
          activated
        />
      )
      const cancelButton = screen.getByRole('button', { name: /Cancel/ })
      expect(cancelButton).toBeInTheDocument()
    })

    it('renders deactivate button', () => {
      const closeModalMock = vi.fn()
      const deactivateRepoMock = vi.fn()

      render(
        <DeactivateRepoModal
          closeModal={closeModalMock}
          deactivateRepo={deactivateRepoMock}
          isLoading={false}
          showModal={true}
          activated
        />
      )
      const deactivateButton = screen.getByRole('button', {
        name: 'Deactivate repo',
      })
      expect(deactivateButton).toBeInTheDocument()
    })

    it('closes modal when cancel is clicked', async () => {
      const { user } = setup()
      const closeModalMock = vi.fn()
      const deactivateRepoMock = vi.fn()

      render(
        <DeactivateRepoModal
          closeModal={closeModalMock}
          deactivateRepo={deactivateRepoMock}
          isLoading={false}
          showModal={true}
          activated
        />
      )
      const cancelButton = screen.getByRole('button', { name: /Cancel/ })

      await user.click(cancelButton)
      expect(closeModalMock).toHaveBeenCalled()
    })

    it('calls deactivate when deactivate button is clicked', async () => {
      const { user } = setup()
      const closeModalMock = vi.fn()
      const deactivateRepoMock = vi.fn()

      render(
        <DeactivateRepoModal
          closeModal={closeModalMock}
          deactivateRepo={deactivateRepoMock}
          isLoading={false}
          showModal={true}
          activated
        />
      )
      const deactivateButton = screen.getByRole('button', {
        name: 'Deactivate repo',
      })
      await user.click(deactivateButton)
      expect(deactivateRepoMock).toHaveBeenCalledWith(true)
    })
  })

  it('renders correctly when repo is deactivated', async () => {
    const { user } = setup()
    const closeModalMock = vi.fn()
    const deactivateRepoMock = vi.fn()

    render(
      <DeactivateRepoModal
        closeModal={closeModalMock}
        deactivateRepo={deactivateRepoMock}
        isLoading={false}
        activated={false}
        showModal={true}
      />
    )

    const deactivateButton = screen.getByRole('button', {
      name: 'Deactivate repo',
    })
    expect(deactivateButton).toBeInTheDocument()

    await user.click(deactivateButton)
    expect(deactivateRepoMock).toHaveBeenCalledWith(false)
  })
})
