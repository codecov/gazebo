import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import config from 'config'

import { useOnboardingTracking, useUser } from 'services/user'

import InstructionBox from '.'

jest.mock('services/user')
jest.mock('copy-to-clipboard', () => () => true)
jest.mock('config')

describe('InstructionBox', () => {
  function setup({ isSelfHosted = false } = {}) {
    const mockTerminalUploaderCommandClicked = jest.fn()
    config.BASE_URL = 'https://app.codecov.io'
    config.IS_SELF_HOSTED = isSelfHosted

    useOnboardingTracking.mockReturnValue({
      terminalUploaderCommandClicked: () => {
        mockTerminalUploaderCommandClicked({
          data: {
            category: 'Onboarding',
            userId: 12345,
          },
          event: 'User Onboarding Terminal Uploader Command Clicked',
        })
      },
    })
    useUser.mockReturnValue({
      data: {
        username: "Patia Por'co",
        trackingMetadata: {
          ownerid: 12345,
        },
      },
    })

    return {
      terminalUploaderCommandClicked: mockTerminalUploaderCommandClicked,
    }
  }

  describe('when rendered', () => {
    beforeEach(() => setup())

    it('renders Linux button', () => {
      render(<InstructionBox />)

      const btn = screen.getByRole('button', { name: 'Linux' })
      expect(btn).toBeInTheDocument()
    })

    it('renders MacOS button', () => {
      render(<InstructionBox />)

      const btn = screen.getByRole('button', { name: 'macOS' })
      expect(btn).toBeInTheDocument()
    })

    it('renders Alpine Linux button', () => {
      render(<InstructionBox />)

      const btn = screen.getByRole('button', { name: 'Alpine Linux' })
      expect(btn).toBeInTheDocument()
    })

    it('renders Windows button', () => {
      render(<InstructionBox />)

      const btn = screen.getByRole('button', { name: 'Windows' })
      expect(btn).toBeInTheDocument()
    })
  })

  describe('when rendered any tab but not windows', () => {
    beforeEach(() => setup())

    it('does not render the windows instruction', () => {
      render(<InstructionBox />)

      const instruction = screen.queryByText(/$ProgressPreference /)
      expect(instruction).not.toBeInTheDocument()
    })

    it('renders the other instructions', () => {
      render(<InstructionBox />)

      const instruction = screen.queryByText(/curl/)
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on windows', () => {
    beforeEach(() => setup())

    it('renders the windows instruction', async () => {
      const user = userEvent.setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Windows' }))
      const instruction = screen.queryByText(/\$ProgressPreference/)
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on windows an user is a self hosted user', () => {
    beforeEach(() => setup({ isSelfHosted: true }))

    it('renders windows specific instruction', async () => {
      const user = userEvent.setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Windows' }))

      const windowsInstruction = screen.getByText(/windows\/codecov/)
      expect(windowsInstruction).toBeInTheDocument()
    })

    it('renders with expected base uploader url', async () => {
      const user = userEvent.setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Windows' }))

      const baseUrl = screen.getByText(/https:\/\/app.codecov.io\/uploader/)
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders self hosted specific instruction', async () => {
      const user = userEvent.setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Windows' }))

      const selfHostedInstruction = screen.getByText(
        /\/codecov -u https:\/\/app.codecov.io/
      )
      expect(selfHostedInstruction).toBeInTheDocument()
    })
  })

  describe('when click on linux', () => {
    beforeEach(() => setup())

    it('renders the linux instruction', async () => {
      const user = userEvent.setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Linux' }))
      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader.codecov.io\/latest\/linux\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Alpine', () => {
    beforeEach(() => setup())

    it('renders the Alpine instruction', async () => {
      const user = userEvent.setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Alpine Linux' }))
      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader.codecov.io\/latest\/alpine\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Mac', () => {
    beforeEach(() => setup())

    it('renders the Mac instruction', async () => {
      const user = userEvent.setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'macOS' }))
      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader.codecov.io\/latest\/macos\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when the user clicks on the clipboard copy link', () => {
    it('calls the trackSegmentEvent', async () => {
      const { terminalUploaderCommandClicked } = setup()
      const user = userEvent.setup()
      render(<InstructionBox />)

      const clipboard = screen.getByRole('button', {
        name: 'clipboard-copy.svg copy',
      })
      await user.click(clipboard)

      await waitFor(() => {
        expect(terminalUploaderCommandClicked).toHaveBeenCalledWith({
          event: 'User Onboarding Terminal Uploader Command Clicked',
          data: {
            category: 'Onboarding',
            userId: 12345,
          },
        })
      })
    })
  })
})
