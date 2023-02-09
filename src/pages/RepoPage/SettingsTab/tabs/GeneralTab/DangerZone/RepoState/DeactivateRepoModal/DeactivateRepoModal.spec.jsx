import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import DeactivateRepoModal from './DeactivateRepoModal'

describe('DeactivateRepoModal component', () => {
  const closeModalMock = jest.fn()
  const deactivateRepoMock = jest.fn()

  it('renders correctly when repo is activated', () => {
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

    const modalBody = screen.getByText(
      /Deactivate repo will deactivate a repo and prevent the upload of coverage information to that repo going forward./
    )
    expect(modalBody).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: /Cancel/ })
    expect(cancelButton).toBeInTheDocument()

    const deactivateButton = screen.getByTestId(/deactivate-repo/)
    expect(deactivateButton).toBeInTheDocument()

    userEvent.click(cancelButton)
    expect(closeModalMock).toHaveBeenCalled()

    userEvent.click(deactivateButton)
    expect(deactivateRepoMock).toHaveBeenCalledWith(true)
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

    const deactivateButton = screen.getByTestId(/deactivate-repo/)
    expect(deactivateButton).toBeInTheDocument()

    userEvent.click(deactivateButton)
    expect(deactivateRepoMock).toHaveBeenCalledWith(false)
  })
})
