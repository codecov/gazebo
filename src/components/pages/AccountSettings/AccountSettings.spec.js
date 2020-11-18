import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import AccountSettings from './AccountSettings'

jest.mock('./tabs/Admin', () => () => 'AdminTab')
jest.mock('./tabs/BillingAndUsers', () => () => 'BillingAndUsersTab')
jest.mock('./tabs/YAML', () => () => 'YAMLTab')

describe('AccountSettings', () => {
  function setup() {
    render(<AccountSettings />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup('/')
    })

    it('renders the BillingAndUsers tab', () => {
      const tab = screen.getByText(/BillingAndUsersTab/)
      expect(tab).toBeInTheDocument()
    })

    describe('when clicking on yaml', () => {
      beforeEach(() => {
        userEvent.click(screen.getByText(/YAML/))
      })

      it('renders the Yaml tab', () => {
        const tab = screen.getByText(/YAMLTab/)
        expect(tab).toBeInTheDocument()
      })
    })

    describe('when rendering on admin tab', () => {
      beforeEach(() => {
        userEvent.click(screen.getByText(/Admin/))
      })

      it('renders the Admin tab', () => {
        const tab = screen.getByText(/AdminTab/)
        expect(tab).toBeInTheDocument()
      })
    })
  })
})
