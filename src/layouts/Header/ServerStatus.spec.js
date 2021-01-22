import { render, screen } from '@testing-library/react'

import { useServerStatus } from 'services/status'
import ServerStatus from './ServerStatus'

jest.mock('services/status/hooks')

describe('ServerStatus', () => {
  function setup() {
    render(<ServerStatus />)
  }
  describe('Server status fetching', () => {
    beforeEach(() => {
      useServerStatus.mockReturnValue({
        isSuccess: false,
      })
      setup()
    })

    it('The correct accessibility message', () => {
      const span = screen.getByText(/Server Status Unknown/)
      expect(span).toBeInTheDocument()
    })

    it('Icon is the correct color', () => {
      const icon = screen.getByTestId('server-icon')
      expect(icon).toHaveClass('text-gray-400')
    })
  })

  describe.each`
    serverStatus  | screenReader             | iconColor
    ${'none'}     | ${/Server Up/}           | ${'text-success-700'}
    ${'critical'} | ${/Server Down/}         | ${'text-codecov-red'}
    ${'major'}    | ${/Major Server Issues/} | ${'text-codecov-red'}
    ${'minor'}    | ${/Minor Server Issues/} | ${'text-warning-500'}
  `('Server status rendering', ({ serverStatus, screenReader, iconColor }) => {
    beforeEach(() => {
      useServerStatus.mockReturnValue({
        isSuccess: true,
        data: { status: { indicator: serverStatus } },
      })
      setup()
    })

    it('The correct accessibility message', () => {
      const span = screen.getByText(screenReader)
      expect(span).toBeInTheDocument()
    })

    it('Icon is the correct color', () => {
      const icon = screen.getByTestId('server-icon')
      expect(icon).toHaveClass(iconColor)
    })
  })
})
