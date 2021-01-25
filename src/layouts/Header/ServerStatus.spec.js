import { render, screen } from '@testing-library/react'

import { useServerStatus } from 'services/status'
import ServerStatus from './ServerStatus'

jest.mock('services/status/hooks')

describe('ServerStatus', () => {
  function setup() {
    render(<ServerStatus />)
  }

  describe('Show server up until status api resolves.', () => {
    beforeEach(() => {
      useServerStatus.mockReturnValue({
        isLoading: true,
      })
      setup()
    })

    it('The correct accessibility message', () => {
      const span = screen.getByText(/All Systems Operational/)
      expect(span).toBeInTheDocument()
    })

    it('Icon is the correct color', () => {
      const icon = screen.getByTestId('server-icon')
      expect(icon).toHaveClass('text-success-700')
    })
  })

  describe('Api errored', () => {
    beforeEach(() => {
      useServerStatus.mockReturnValue({
        isError: true,
      })
      setup()
    })

    it('The correct accessibility message', () => {
      const span = screen.getByText(/Status Unknown/)
      expect(span).toBeInTheDocument()
    })

    it('Icon is the correct color', () => {
      const icon = screen.getByTestId('server-icon')
      expect(icon).toHaveClass('text-gray-400')
    })
  })

  describe.each`
    indicator     | description              | iconColor
    ${'none'}     | ${'Server Up'}           | ${'text-success-700'}
    ${'critical'} | ${'Server Down'}         | ${'text-codecov-red'}
    ${'major'}    | ${'Major Server Issues'} | ${'text-codecov-red'}
    ${'minor'}    | ${'Minor Server Issues'} | ${'text-warning-500'}
  `('Server status rendering', ({ indicator, description, iconColor }) => {
    beforeEach(() => {
      useServerStatus.mockReturnValue({
        isSuccess: true,
        data: { indicator, description },
      })
      setup()
    })

    it('The correct accessibility message', () => {
      const span = screen.getByText(description)
      expect(span).toBeInTheDocument()
    })

    it('Icon is the correct color', () => {
      const icon = screen.getByTestId('server-icon')
      expect(icon).toHaveClass(iconColor)
    })
  })
})
