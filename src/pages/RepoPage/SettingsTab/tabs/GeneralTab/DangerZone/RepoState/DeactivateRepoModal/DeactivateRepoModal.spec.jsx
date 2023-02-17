import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import DeactivateRepoModal from './DeactivateRepoModal'

describe('DeactivateRepoModal component', () => {
  const closeModalMock = jest.fn()
  const deactivateRepoMock = jest.fn()

  describe('renders the component correctly', () => {
    it('renders modal title', () => {
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

    it('closes modal when cancel is clicked', () => {
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

      userEvent.click(cancelButton)
      expect(closeModalMock).toHaveBeenCalled()
    })

    it('calls deactivate when deactivate button is clicked', () => {
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
      userEvent.click(deactivateButton)
      expect(deactivateRepoMock).toHaveBeenCalledWith(true)
    })
  })

  it('renders correctly when repo is deactivated', () => {
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

    userEvent.click(deactivateButton)
    expect(deactivateRepoMock).toHaveBeenCalledWith(false)
  })
})
