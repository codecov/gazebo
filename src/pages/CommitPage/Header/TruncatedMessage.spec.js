import { fireEvent, render, screen } from '@testing-library/react'

import TruncatedMessage from './TruncatedMessage'

const longMessage =
  'Magna fugiat ad incididunt esse duis ipsum. Elit exercitation culpa est Lorem nostrud non aliquip Lorem dolore. Enim cillum aute fugiat aute fugiat ea proident fugiat cupidatat irure anim dolore adipisicing.'

describe('TruncatedMessage', () => {
  function setup({ message }) {
    render(<TruncatedMessage message={message} />)
  }

  describe('renders short message as it is', () => {
    beforeEach(() => {
      setup({ message: 'This is a short message' })
    })

    it('renders the message', () => {
      expect(screen.getByText(/This is a short message/)).toBeInTheDocument()
    })

    it('hides the truncate button', () => {
      expect(screen.queryByText(/see more.../)).not.toBeInTheDocument()
    })
  })

  describe('renders truncated long message', () => {
    beforeEach(() => {
      setup({ message: longMessage })
    })

    it('renders the short version of the message', () => {
      const shortVersion = longMessage.substr(0, 50)
      expect(screen.getByText(shortVersion)).toBeInTheDocument()
    })

    it('renders the expand button', () => {
      expect(screen.getByText(/see more.../)).toBeInTheDocument()
    })
  })

  describe('when expand a truncated message', () => {
    beforeEach(() => {
      setup({ message: longMessage })
      const button = screen.getByText('see more...')
      fireEvent.click(button)
    })

    it('renders see less...', () => {
      expect(screen.getByText(/see less.../)).toBeInTheDocument()
    })
  })
})
