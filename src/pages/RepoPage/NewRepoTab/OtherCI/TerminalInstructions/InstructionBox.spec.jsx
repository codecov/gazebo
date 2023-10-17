import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'

import config from 'config'

import InstructionBox from '.'

jest.mock('services/user')
jest.mock('copy-to-clipboard', () => () => true)
jest.mock('config')

describe('InstructionBox', () => {
  function setup({ isSelfHosted = false } = {}) {
    const user = userEvent.setup()
    const mockTerminalUploaderCommandClicked = jest.fn()

    config.BASE_URL = 'https://app.codecov.io'
    config.IS_SELF_HOSTED = isSelfHosted

    graphql.query('CurrentUser', (_, res, ctx) =>
      res(
        ctx.status(200),
        ctx.data({
          me: {
            user: { username: "Patia Por'co" },
            trackingMetadata: { ownerid: 12345 },
          },
        })
      )
    )

    return {
      terminalUploaderCommandClicked: mockTerminalUploaderCommandClicked,
      user,
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
    it('renders the windows instruction', async () => {
      const { user } = setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Windows' }))
      const instruction = screen.queryByText(/\$ProgressPreference/)
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on windows an user is a self hosted user', () => {
    it('renders windows specific instruction', async () => {
      const { user } = setup({ isSelfHosted: true })
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Windows' }))

      const windowsInstruction = screen.getByText(/windows\/codecov/)
      expect(windowsInstruction).toBeInTheDocument()
    })

    it('renders with expected base uploader url', async () => {
      const { user } = setup({ isSelfHosted: true })
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Windows' }))

      const baseUrl = screen.getByText(/https:\/\/app\.codecov\.io\/uploader/)
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders self hosted specific instruction', async () => {
      const { user } = setup({ isSelfHosted: true })
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Windows' }))

      const selfHostedInstruction = screen.getByText(
        /\/codecov -u https:\/\/app\.codecov\.io/
      )
      expect(selfHostedInstruction).toBeInTheDocument()
    })
  })

  describe('when click on linux', () => {
    it('renders the linux instruction', async () => {
      const { user } = setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Linux' }))
      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader\.codecov\.io\/latest\/linux\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Alpine', () => {
    it('renders the Alpine instruction', async () => {
      const { user } = setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'Alpine Linux' }))
      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader\.codecov\.io\/latest\/alpine\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Mac', () => {
    it('renders the Mac instruction', async () => {
      const { user } = setup()
      render(<InstructionBox />)

      await user.click(screen.getByRole('button', { name: 'macOS' }))
      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader.codecov.io\/latest\/macos\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })
})
