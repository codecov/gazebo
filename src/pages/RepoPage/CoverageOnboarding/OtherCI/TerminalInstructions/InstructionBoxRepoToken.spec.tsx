import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import config from 'config'

import { InstructionBoxRepoToken } from './InstructionBoxRepoToken'

jest.mock('copy-to-clipboard', () => () => true)
jest.mock('config')

describe('InstructionBoxRepoToken', () => {
  function setup({ isSelfHosted = false } = {}) {
    const user = userEvent.setup()

    config.BASE_URL = 'https://app.codecov.io'
    config.IS_SELF_HOSTED = isSelfHosted

    return {
      user,
    }
  }

  describe('when rendered', () => {
    beforeEach(() => setup())

    it('renders Linux button', () => {
      render(<InstructionBoxRepoToken />)

      const button = screen.getByRole('button', { name: 'Linux' })
      expect(button).toBeInTheDocument()
    })

    it('renders MacOS button', () => {
      render(<InstructionBoxRepoToken />)

      const button = screen.getByRole('button', { name: 'macOS' })
      expect(button).toBeInTheDocument()
    })

    it('renders Alpine Linux button', () => {
      render(<InstructionBoxRepoToken />)

      const button = screen.getByRole('button', { name: 'Alpine Linux' })
      expect(button).toBeInTheDocument()
    })

    it('renders Windows button', () => {
      render(<InstructionBoxRepoToken />)

      const button = screen.getByRole('button', { name: 'Windows' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('when rendered any tab but not windows', () => {
    beforeEach(() => setup())

    it('does not render windows instruction', () => {
      render(<InstructionBoxRepoToken />)

      const instruction = screen.queryByText(/$ProgressPreference /)
      expect(instruction).not.toBeInTheDocument()
    })
  })

  describe('when click on windows', () => {
    it('renders the windows instruction', async () => {
      const { user } = setup()
      render(<InstructionBoxRepoToken />)

      const WindowsButton = screen.getByRole('button', { name: 'Windows' })
      await user.click(WindowsButton)

      const instruction = screen.getByText(/\$ProgressPreference/)
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on windows an user is a self hosted user', () => {
    it('renders windows specific instruction', async () => {
      const { user } = setup({ isSelfHosted: true })
      render(<InstructionBoxRepoToken />)

      const WindowsButton = screen.getByRole('button', { name: 'Windows' })
      await user.click(WindowsButton)

      const windowsInstruction = screen.getByText(/windows\/codecov/)
      expect(windowsInstruction).toBeInTheDocument()
    })

    it('renders with expected base uploader url', async () => {
      const { user } = setup({ isSelfHosted: true })
      render(<InstructionBoxRepoToken />)

      const WindowsButton = screen.getByRole('button', { name: 'Windows' })
      await user.click(WindowsButton)

      const baseUrl = screen.getByText(/https:\/\/app\.codecov\.io\/uploader/)
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders self hosted specific instruction', async () => {
      const { user } = setup({ isSelfHosted: true })
      render(<InstructionBoxRepoToken />)

      const WindowsButton = screen.getByRole('button', { name: 'Windows' })
      await user.click(WindowsButton)

      const selfHostedInstruction = screen.getByText(
        /\/codecov -u https:\/\/app\.codecov\.io/
      )
      expect(selfHostedInstruction).toBeInTheDocument()
    })
  })

  describe('when click on linux', () => {
    it('renders the linux instruction', async () => {
      const { user } = setup()
      render(<InstructionBoxRepoToken />)

      const LinuxButton = screen.getByRole('button', { name: 'Linux' })
      await user.click(LinuxButton)

      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader\.codecov\.io\/latest\/linux\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Alpine', () => {
    it('renders the Alpine instruction', async () => {
      const { user } = setup()
      render(<InstructionBoxRepoToken />)

      const alpineButton = screen.getByRole('button', { name: 'Alpine Linux' })
      await user.click(alpineButton)

      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader\.codecov\.io\/latest\/alpine\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Mac', () => {
    it('renders the Mac instruction', async () => {
      const { user } = setup()
      render(<InstructionBoxRepoToken />)

      const macButton = screen.getByRole('button', { name: 'macOS' })
      await user.click(macButton)

      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader.codecov.io\/latest\/macos\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })
})
