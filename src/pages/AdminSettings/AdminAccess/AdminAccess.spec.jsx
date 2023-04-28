import { render, screen } from '@testing-library/react'

import AdminAccess from './AdminAccess'

jest.mock('./AdminAccessTable', () => () => 'AdminAccessTable')

describe('AdminAccess', () => {
  describe('displays title', () => {
    it('renders title', async () => {
      render(<AdminAccess />)

      const table = await screen.findByText('AdminAccessTable')
      expect(table).toBeInTheDocument()

      const title = screen.getByText('Administrator Access')
      expect(title).toBeInTheDocument()
    })
  })

  describe('displays sub title', () => {
    describe('sub title text', () => {
      it('renders sub title text', async () => {
        render(<AdminAccess />)

        const table = await screen.findByText('AdminAccessTable')
        expect(table).toBeInTheDocument()

        const subTitle = screen.getByText('Admins can be edited in the')
        expect(subTitle).toBeInTheDocument()
      })
    })

    describe('install.yml links to docs', () => {
      it('providers the correct href', async () => {
        render(<AdminAccess />)

        const table = await screen.findByText('AdminAccessTable')
        expect(table).toBeInTheDocument()

        const link = screen.getByText('install.yml')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          'https://docs.codecov.com/v5.0/docs/configuration'
        )
      })
    })

    describe('learn more links to docs', () => {
      it('providers the correct href', async () => {
        render(<AdminAccess />)

        const table = await screen.findByText('AdminAccessTable')
        expect(table).toBeInTheDocument()

        const link = screen.getByText('learn more')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          'https://docs.codecov.com/v5.0/docs/configuration#install-wide-admins'
        )
      })
    })
  })

  describe('displays table', () => {
    it('renders component', async () => {
      render(<AdminAccess />)

      const table = await screen.findByText('AdminAccessTable')
      expect(table).toBeInTheDocument()
    })
  })
})
