import { renderHook, act } from '@testing-library/react-hooks'
import { useOnboardingTracking } from './useOnboardingTracking'
import { useOnboardingLocation } from 'services/location/hooks'
import {
  trackSegmentEvent,
  pageSegmentEvent,
  identifySegmentEvent,
} from 'services/tracking/segment'

jest.mock('services/tracking/segment')
jest.mock('services/location/hooks')

describe('useOnboardingTracking', () => {
  let hookData

  function setup() {
    hookData = renderHook(() => useOnboardingTracking())
  }

  beforeEach(() => {
    useOnboardingLocation.mockReturnValue({
      path: '/campaign/three/rocks',
      url: 'www.criticalrole.com/campaign/three/rocks',
    })
    setup()
  })

  describe('startOnboarding', () => {
    beforeEach(() => {
      act(() => {
        hookData.result.current.startOnboarding()
      })
    })

    it('calls segment event with specific information', () => {
      expect(trackSegmentEvent).toHaveBeenCalledWith({
        category: 'Onboarding',
        event: 'User Started Onboarding',
      })
      expect(pageSegmentEvent).toHaveBeenCalledWith({
        event: 'Onboarding Page 1',
        path: '/campaign/three/rocks/onboarding/1',
        url: 'www.criticalrole.com/campaign/three/rocks/onboarding/1',
      })
    })
  })

  describe('secondPage', () => {
    beforeEach(() => {
      act(() => {
        hookData.result.current.secondPage()
      })
    })

    it('calls segment event with specific information', () => {
      expect(pageSegmentEvent).toHaveBeenCalledWith({
        event: 'Onboarding Page 2',
        path: '/campaign/three/rocks/onboarding/2',
        url: 'www.criticalrole.com/campaign/three/rocks/onboarding/2',
      })
    })
  })

  describe('completedOnboarding', () => {
    const user = {
      trackingMetadata: {
        ownerid: 4,
      },
    }
    const data = {
      businessEmail: '',
      email: 'adrian@codecov.io',
      goals: ['MAINTAIN_COVERAGE', 'TEAM_REQUIREMENTS'],
      otherGoal: '',
      typeProjects: ['EDUCATIONAL'],
    }
    beforeEach(() => {
      act(() => {
        hookData.result.current.completedOnboarding(user, data)
      })
    })

    it('calls segment event with specific information', () => {
      expect(trackSegmentEvent).toHaveBeenCalledWith({
        category: 'Onboarding',
        event: 'User Completed Onboarding',
      })
      expect(identifySegmentEvent).toHaveBeenCalledWith({
        data: {
          businessEmail: '',
          email: 'adrian@codecov.io',
          goals: 'MAINTAIN_COVERAGE;TEAM_REQUIREMENTS',
          otherGoal: '',
          typeProjects: 'EDUCATIONAL',
        },
        id: 4,
      })
    })
  })
})
