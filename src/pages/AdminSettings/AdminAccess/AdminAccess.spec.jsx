import { render, screen } from '@testing-library/react'

import AdminAccess from './AdminAccess'

jest.mock('./AdminAccessTable', () => () => 'AdminAccessTable')

describe('AdminAccess', () => {
  function setup() {
    render(<AdminAccess />)
  }

  describe('displays title', () => {
    beforeEach(() => {
      setup()
    })

    it('renders title', () => {
      const title = screen.getByText('Administrator Access')
      expect(title).toBeInTheDocument()
    })
  })

  describe('displays sub title', () => {
    describe('sub title text', () => {
      beforeEach(() => {
        setup()
      })

      it('renders sub title text', () => {
        const subTitle = screen.getByText('Admins can be edited in the')
        expect(subTitle).toBeInTheDocument()
      })
    })

    describe('install.yml links to docs', () => {
      beforeEach(() => {
        setup()
      })

      it('providers the correct href', () => {
        const link = screen.getByText('install.yml')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          'https://docs.codecov.com/v5.0/docs/configuration'
        )
      })
    })

    describe('learn more links to docs', () => {
      beforeEach(() => {
        setup()
      })

      it('providers the correct href', () => {
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
    beforeEach(() => {
      setup()
    })

    it('renders component', () => {
      const table = screen.getByText('AdminAccessTable')
      expect(table).toBeInTheDocument()
    })
  })
})
