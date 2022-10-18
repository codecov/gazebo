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

const user = {
  username: 'Laerryn Coramar-Seelie',
  trackingMetadata: {
    ownerid: 4,
  },
}

describe('useOnboardingTracking', () => {
  let hookData

  function setup() {
    hookData = renderHook(() => useOnboardingTracking())
  }

  beforeEach(() => {
    useUser.mockReturnValue({ data: user })
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

  describe('helpFindingOrganization', () => {
    beforeEach(() => {
      act(() => {
        hookData.result.current.helpFindingOrganization()
      })
    })

    it('calls segment event with specific information', () => {
      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Help Finding Org Clicked',
        data: {
          category: 'Onboarding',
        },
      })
    })
  })

  describe('skipOnboarding', () => {
    beforeEach(() => {
      act(() => {
        hookData.result.current.skipOnboarding()
      })
    })

    it('calls segment event with specific information', () => {
      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Skipped',
        data: {
          category: 'Onboarding',
        },
      })
    })
  })

  describe('selectOrganization', () => {
    beforeEach(() => {
      act(() => {
        hookData.result.current.selectOrganization(user, 'codecov')
      })
    })

    it('calls segment event with specific information', () => {
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
    beforeEach(() => {
      act(() => {
        hookData.result.current.downloadUploaderClicked()
      })
    })

    it('calls segment event with specific information', () => {
      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Download Uploader Clicked',
        data: {
          category: 'Onboarding',
          userId: user.trackingMetadata.ownerid,
        },
      })
    })
  })

  describe('copiedCIToken', () => {
    beforeEach(() => {
      const token = 'c8859fa7-9449-45ba-9210-69c12034f097'
      act(() => {
        hookData.result.current.copiedCIToken(token)
      })
    })

    it('calls segment event with specific information', () => {
      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Copied CI Token',
        data: {
          category: 'Onboarding',
          userId: user.trackingMetadata.ownerid,
          tokenHash: '2034f097',
        },
      })
    })
  })

  describe('terminalUploaderCommandClicked', () => {
    beforeEach(() => {
      act(() => {
        hookData.result.current.terminalUploaderCommandClicked()
      })
    })

    it('calls segment event with specific information', () => {
      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Terminal Uploader Command Clicked',
        data: {
          category: 'Onboarding',
          userId: user.trackingMetadata.ownerid,
        },
      })
    })
  })
})
