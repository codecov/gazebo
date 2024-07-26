import { render, screen } from '@testing-library/react'

import { Plans } from 'shared/utils/billing'

import Controller from './Controller'

jest.mock('./ProPlanController', () => () => 'Pro Plan Controller')
jest.mock('./SentryPlanController', () => () => 'Sentry Plan Controller')
jest.mock('./TeamPlanController', () => () => 'Team Plan Controller')

describe('Controller', () => {
  describe('Form Controller', () => {
    describe('when plan is a codecov pro plan', () => {
      it('renders Pro Plan Controller for yearly plan', async () => {
        const props = {
          seats: 10,
          selectedPlan: Plans.USERS_PR_INAPPY,
          register: jest.fn(),
          setFormValue: jest.fn(),
          setSelectedPlan: jest.fn(),
          newPlan: Plans.USERS_TEAMM,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const proPlanController = await screen.findByText(/Pro Plan Controller/)
        expect(proPlanController).toBeInTheDocument()

        const sentryPlanController = screen.queryByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).not.toBeInTheDocument()

        const teamPlanController = screen.queryByText(/Team Plan Controller/)
        expect(teamPlanController).not.toBeInTheDocument()
      })

      it('renders Pro Plan Controller for monthly plan', async () => {
        const props = {
          seats: 10,
          selectedPlan: Plans.USERS_PR_INAPPM,
          register: jest.fn(),
          setFormValue: jest.fn(),
          setSelectedPlan: jest.fn(),
          newPlan: Plans.USERS_TEAMM,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const proPlanController = await screen.findByText(/Pro Plan Controller/)
        expect(proPlanController).toBeInTheDocument()

        const sentryPlanController = screen.queryByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).not.toBeInTheDocument()

        const teamPlanController = screen.queryByText(/Team Plan Controller/)
        expect(teamPlanController).not.toBeInTheDocument()
      })
    })

    describe('when plan is a sentry pro plan', () => {
      it('renders Sentry Plan Controller for yearly plan', async () => {
        const props = {
          seats: 10,
          selectedPlan: Plans.USERS_SENTRYY,
          register: jest.fn(),
          setFormValue: jest.fn(),
          setSelectedPlan: jest.fn(),
          newPlan: Plans.USERS_TEAMM,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const sentryPlanController = await screen.findByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).toBeInTheDocument()

        const proPlanController = screen.queryByText(/Pro Plan Controller/)
        expect(proPlanController).not.toBeInTheDocument()

        const teamPlanController = screen.queryByText(/Team Plan Controller/)
        expect(teamPlanController).not.toBeInTheDocument()
      })

      it('renders Sentry Plan Controller for monthly plan', async () => {
        const props = {
          seats: 10,
          selectedPlan: Plans.USERS_SENTRYM,
          register: jest.fn(),
          setFormValue: jest.fn(),
          setSelectedPlan: jest.fn(),
          newPlan: Plans.USERS_TEAMM,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const sentryPlanController = await screen.findByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).toBeInTheDocument()

        const proPlanController = screen.queryByText(/Pro Plan Controller/)
        expect(proPlanController).not.toBeInTheDocument()

        const teamPlanController = screen.queryByText(/Team Plan Controller/)
        expect(teamPlanController).not.toBeInTheDocument()
      })
    })

    describe('when plan is a team plan', () => {
      it('renders Team Plan Controller for yearly plan', async () => {
        const props = {
          seats: 10,
          selectedPlan: Plans.USERS_TEAMY,
          register: jest.fn(),
          setFormValue: jest.fn(),
          setSelectedPlan: jest.fn(),
          newPlan: Plans.USERS_TEAMM,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const teamPlanController =
          await screen.findByText(/Team Plan Controller/)
        expect(teamPlanController).toBeInTheDocument()

        const proPlanController = screen.queryByText(/Pro Plan Controller/)
        expect(proPlanController).not.toBeInTheDocument()

        const sentryPlanController = screen.queryByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).not.toBeInTheDocument()
      })

      it('renders Team Plan Controller for monthly plan', async () => {
        const props = {
          seats: 10,
          selectedPlan: Plans.USERS_TEAMM,
          register: jest.fn(),
          setFormValue: jest.fn(),
          setSelectedPlan: jest.fn(),
          newPlan: Plans.USERS_TEAMM,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const teamPlanController =
          await screen.findByText(/Team Plan Controller/)
        expect(teamPlanController).toBeInTheDocument()

        const proPlanController = screen.queryByText(/Pro Plan Controller/)
        expect(proPlanController).not.toBeInTheDocument()

        const sentryPlanController = screen.queryByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).not.toBeInTheDocument()
      })
    })
  })
})
