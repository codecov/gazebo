import { render, screen } from '@testing-library/react'

import ServerStatus, { MODE } from './ServerStatus'
import StatusService from 'services/status'

jest.mock('services/status', () => {
  return {
    useServerStatus: jest.fn(),
  }
})

describe('ServerStatus', () => {
  function setup() {
    render(<ServerStatus />)
  }

  describe.each`
    serverStatus | screenReader          | textColor
    ${'unknown'} | ${MODE['unknown'].sr} | ${MODE['unknown'].textColor}
    ${'up'}      | ${MODE['up'].sr}      | ${MODE['up'].textColor}
    ${'down'}    | ${MODE['down'].sr}    | ${MODE['down'].textColor}
    ${'warning'} | ${MODE['warning'].sr} | ${MODE['warning'].textColor}
  `('Server status rendering', ({ serverStatus, screenReader, textColor }) => {
    beforeEach(() => {
      StatusService.useServerStatus.mockReturnValue([serverStatus])
      setup()
    })

    it('The correct accessibility message', () => {
      const span = screen.getByText(screenReader)
      expect(span).toBeInTheDocument()
    })

    it('Icon is the correct color', () => {
      const icon = screen.getByTestId('server-icon')
      expect(icon).toHaveClass(textColor)
    })
  })
})
