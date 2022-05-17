import { render, screen } from '@testing-library/react'

import { LINE_STATE } from 'shared/utils/fileviewerLines'

import CoverageSelect from './CoverageSelect'

const onChange = jest.fn(() => {})

describe('CoverageSelect', () => {
  function setup(coverage) {
    render(
      <CoverageSelect coverage={coverage} checked={false} onChange={onChange} />
    )
  }

  describe('renders covered', () => {
    beforeEach(() => {
      setup(LINE_STATE.COVERED)
    })

    it('covered', () => {
      expect(screen.getByText('covered')).toBeInTheDocument()
    })
  })

  describe('renders uncovered', () => {
    beforeEach(() => {
      setup(LINE_STATE.UNCOVERED)
    })

    it('uncovered', () => {
      expect(screen.getByText('uncovered')).toBeInTheDocument()
    })
  })

  describe('renders partial', () => {
    beforeEach(() => {
      setup(LINE_STATE.PARTIAL)
    })

    it('partial', () => {
      expect(screen.getByText('partial')).toBeInTheDocument()
    })
  })
})
