import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Footer from './Footer'

jest.mock('config')

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('Footer', () => {
  function setup(
    { selfHosted = false, versionNumber } = {
      selfHosted: false,
      versionNumber: undefined,
    }
  ) {
    config.IS_SELF_HOSTED = selfHosted
    config.CODECOV_VERSION = versionNumber
  }

  describe('rendering the feedback link', () => {
    it('renders the link', () => {
      render(<Footer />, { wrapper })

      const feedback = screen.getByRole('link', { name: 'Feedback' })
      expect(feedback).toBeInTheDocument()
      expect(feedback).toHaveAttribute(
        'href',
        'https://github.com/codecov/feedback/discussions'
      )
    })
  })

  describe('renders the current years copyright', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('3301-01-01'))
      setup()
    })

    afterEach(() => jest.resetAllMocks())

    afterAll(() => {
      jest.useRealTimers()
    })

    it('renders a link', () => {
      render(<Footer />, { wrapper })

      const copyright = screen.getByText(`© 3301 Sentry`)
      expect(copyright).toBeInTheDocument()
    })
  })

  describe('build mode specific links', () => {
    describe('on cloud', () => {
      beforeEach(() => {
        setup()
      })

      afterEach(() => jest.resetAllMocks())

      it('renders the link', () => {
        render(<Footer />, { wrapper })

        const pricing = screen.getByText('Pricing')
        expect(pricing).toBeInTheDocument()
      })

      it('renders licensing link', () => {
        render(<Footer />, { wrapper })

        const licensing = screen.queryByText('Licensing')
        expect(licensing).not.toBeInTheDocument()
      })
    })
    describe('self hosted build', () => {
      beforeEach(() => {
        setup({ selfHosted: true })
      })

      afterEach(() => jest.resetAllMocks())

      it('does not render pricing link', () => {
        render(<Footer />, { wrapper })

        const pricing = screen.queryByText('Pricing')
        expect(pricing).not.toBeInTheDocument()
      })
      it('renders licensing link', () => {
        render(<Footer />, { wrapper })

        const licensing = screen.getByText('Licensing')
        expect(licensing).toBeInTheDocument()
      })
    })
  })

  describe('renders the version number', () => {
    describe('app is running in self hosted', () => {
      beforeEach(() => {
        setup({ selfHosted: true, versionNumber: 'v5.0.0' })
      })

      it('displays the version number', () => {
        render(<Footer />, { wrapper })

        const versionNumber = screen.getByText('v5.0.0')
        expect(versionNumber).toBeInTheDocument()
      })
    })

    describe('app is not running in self hosted', () => {
      beforeEach(() => {
        setup({ selfHosted: false })
      })
      it('does not display the version number', () => {
        render(<Footer />, { wrapper })

        const versionNumber = screen.queryByText('v5.0.0')
        expect(versionNumber).not.toBeInTheDocument()
      })
    })
  })
})
