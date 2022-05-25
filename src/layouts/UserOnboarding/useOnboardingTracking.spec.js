import { act, renderHook } from '@testing-library/react-hooks'

import { useOnboardingLocation } from 'services/location/hooks'
import {
  identifySegmentEvent,
  pageSegmentEvent,
  trackSegmentEvent,
} from 'services/tracking/segment'

import { useOnboardingTracking } from './useOnboardingTracking'

jest.mock('services/tracking/segment')
jest.mock('services/location/hooks')

const user = {
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

  describe('helpFindOrg', () => {
    beforeEach(() => {
      act(() => {
        hookData.result.current.helpFindOrg()
      })
    })

    it('calls segment event with specific information', () => {
      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Help Finding Org Clicked',
        category: 'Onboarding',
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
        category: 'Onboarding',
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
        category: 'Onboarding',
      })
      expect(identifySegmentEvent).toHaveBeenCalledWith({
        organization: 'codecov',
        id: 4,
      })
    })
  })

  describe('selectRepository', () => {
    const selectedRepo = {
      name: 'opentelem-ruby',
      active: false,
      private: false,
      coverage: null,
      updatedAt: null,
      latestCommitAt: null,
      author: { username: 'codecov' },
    }

    beforeEach(() => {
      act(() => {
        hookData.result.current.selectRepository(user, selectedRepo)
      })
    })

    it('calls segment event with specific information', () => {
      expect(trackSegmentEvent).toHaveBeenCalledWith({
        event: 'User Onboarding Selected Repo',
        category: 'Onboarding',
      })
      expect(identifySegmentEvent).toHaveBeenCalledWith({
        repo: selectedRepo,
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
