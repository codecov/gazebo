import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import config from 'config'

import { InstructionBox } from './InstructionBox'

vi.mock('copy-to-clipboard', () => ({ default: () => true }))
vi.mock('config')

describe('InstructionBox', () => {
  function setup({ isSelfHosted = false } = {}) {
    const user = userEvent.setup()
    config.IS_SELF_HOSTED = isSelfHosted

    return {
      user,
    }
  }

  describe('when rendered', () => {
    beforeEach(() => setup())

    it('renders Linux button', () => {
      render(<InstructionBox />)

      const button = screen.getByRole('button', { name: 'Linux' })
      expect(button).toBeInTheDocument()
    })

    it('renders MacOS button', () => {
      render(<InstructionBox />)

      const button = screen.getByRole('button', { name: 'macOS' })
      expect(button).toBeInTheDocument()
    })

    it('renders Alpine Linux button', () => {
      render(<InstructionBox />)

      const button = screen.getByRole('button', { name: 'Alpine Linux' })
      expect(button).toBeInTheDocument()
    })

    it('renders Windows button', () => {
      render(<InstructionBox />)

      const button = screen.getByRole('button', { name: 'Windows' })
      expect(button).toBeInTheDocument()
    })

    it('renders linux default instructions', () => {
      render(<InstructionBox />)

      const instruction = screen.queryByText(
        'curl -Os https://cli.codecov.io/latest/linux/codecov/'
      )
      expect(instruction).not.toBeInTheDocument()
    })
  })

  describe('when click on windows', () => {
    it('renders the windows instruction', async () => {
      const { user } = setup()
      render(<InstructionBox />)

      const WindowsButton = screen.getByRole('button', { name: 'Windows' })
      await user.click(WindowsButton)

      const instruction = screen.getByText(/\$ProgressPreference/)
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Alpine', () => {
    it('renders the Alpine instruction', async () => {
      const { user } = setup()
      render(<InstructionBox />)

      const alpineButton = screen.getByRole('button', { name: 'Alpine Linux' })
      await user.click(alpineButton)

      const instruction = screen.getByText(
        /curl -Os https:\/\/cli.codecov.io\/latest\/alpine\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Mac', () => {
    it('renders the Mac instruction', async () => {
      const { user } = setup()
      render(<InstructionBox />)

      const macButton = screen.getByRole('button', { name: 'macOS' })
      await user.click(macButton)

      const instruction = screen.getByText(
        /curl -Os https:\/\/cli.codecov.io\/latest\/macos\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })
})
