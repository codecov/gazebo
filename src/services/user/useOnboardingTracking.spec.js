import { act, renderHook } from '@testing-library/react-hooks'

import { useOnboardingLocation } from 'services/location'
import {
  identifySegmentEvent,
  pageSegmentEvent,
  trackSegmentEvent,
} from 'services/tracking/segment'
import { useUser } from 'services/user'

import { useOnboardingTracking } from './useOnboardingTracking'

jest.mock('services/tracking/segment')
jest.mock('services/location')
jest.mock('services/user')

describe('useOnboardingTracking', () => {
  beforeEach(() => {
    useUser.mockReturnValue({
      data: {
        username: 'Laerryn Coramar-Seelie',
        trackingMetadata: {
          ownerid: 4,
        },
      },
    })
    useOnboardingLocation.mockReturnValue({
      path: '/campaign/three/rocks',
      url: 'www.criticalrole.com/campaign/three/rocks',
    })
  })

  describe('startOnboarding', () => {
    it('calls segment event with specific information', () => {
      const { result } = renderHook(() => useOnboardingTracking())
      act(() => {
        result.current.startOnboarding()
      })

      expect(trackSegmentEvent).toHaveBeenCalledWith({
        data: {
          category: 'Onboarding',
        },
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
    it('calls segment event with specific information', () => {
      const { result } = renderHook(() => useOnboardingTracking())
      act(() => {
        result.current.secondPage()
      })

      expect(pageSegmentEvent).toHaveBeenCalledWith({
        event: 'Onboarding Page 2',
        path: '/campaign/three/rocks/onboarding/2',
        url: 'www.criticalrole.com/campaign/three/rocks/onboarding/2',
      })
    })
  })

  describe('helpFindingOrganization', () => {
    it('calls segment event with specific information', () => {
      const { result } = renderHook(() => useOnboardingTracking())
      act(() => {
        result.current.helpFindingOrganization()
      })

      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Help Finding Org Clicked',
        data: {
          category: 'Onboarding',
        },
      })
    })
  })

  describe('skipOnboarding', () => {
    it('calls segment event with specific information', () => {
      const { result } = renderHook(() => useOnboardingTracking())
      act(() => {
        result.current.skipOnboarding()
      })

      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Skipped',
        data: {
          category: 'Onboarding',
        },
      })
    })
  })

  describe('selectOrganization', () => {
    it('calls segment event with specific information', () => {
      const { result } = renderHook(() => useOnboardingTracking())
      act(() => {
        result.current.selectOrganization(
          {
            username: 'Laerryn Coramar-Seelie',
            trackingMetadata: {
              ownerid: 4,
            },
          },

          'codecov'
        )
      })

      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Selected Org',
        data: {
          category: 'Onboarding',
        },
      })
      expect(identifySegmentEvent).toHaveBeenCalledWith({
        organization: 'codecov',
        id: 4,
      })
    })
  })

  describe('completedOnboarding', () => {
    it('calls segment event with specific information', () => {
      const { result } = renderHook(() => useOnboardingTracking())
      act(() => {
        result.current.completedOnboarding(
          {
            username: 'Laerryn Coramar-Seelie',
            trackingMetadata: {
              ownerid: 4,
            },
          },

          {
            businessEmail: '',
            email: 'adrian@codecov.io',
            goals: ['MAINTAIN_COVERAGE', 'TEAM_REQUIREMENTS'],
            otherGoal: '',
            typeProjects: ['EDUCATIONAL'],
          }
        )
      })

      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Completed Onboarding',
        data: {
          category: 'Onboarding',
        },
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

  describe('downloadUploaderClicked', () => {
    it('calls segment event with specific information', () => {
      const { result } = renderHook(() => useOnboardingTracking())
      act(() => {
        result.current.downloadUploaderClicked()
      })

      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Download Uploader Clicked',
        data: {
          category: 'Onboarding',
          userId: 4,
        },
      })
    })
  })

  describe('copiedCIToken', () => {
    it('calls segment event with specific information', () => {
      const { result } = renderHook(() => useOnboardingTracking())
      act(() => {
        result.current.copiedCIToken('c8859fa7-9449-45ba-9210-69c12034f097')
      })

      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Copied CI Token',
        data: {
          category: 'Onboarding',
          userId: 4,
          tokenHash: '2034f097',
        },
      })
    })
  })

  describe('terminalUploaderCommandClicked', () => {
    it('calls segment event with specific information', () => {
      const { result } = renderHook(() => useOnboardingTracking())
      act(() => {
        result.current.terminalUploaderCommandClicked()
      })

      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Terminal Uploader Command Clicked',
        data: {
          category: 'Onboarding',
          userId: 4,
        },
      })
    })
  })
})
