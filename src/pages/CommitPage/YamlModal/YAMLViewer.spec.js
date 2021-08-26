import { render, screen } from '@testing-library/react'
import YAMLViewer from './YAMLViewer'

describe('YAMLViewer', () => {
  function setup(YAML) {
    render(<YAMLViewer YAML={YAML} />)
  }

  describe('renders', () => {
    beforeEach(() => {
      const YAML = `codecov:\n  max_report_age: false\n  require_ci_to_pass: true\ncomment:\n  behavior: default\n  layout: reach,diff,flags,tree,reach\n  show_carryforward_flags: false\ncoverage:\n  precision: 2\n  range:\n  - 70.0\n  - 100.0\n  round: down\n  status:\n    changes: false\n    default_rules:\n      flag_coverage_not_uploaded_behavior: include\n    patch: true\n    project: true\ngithub_checks:\n  annotations: true\n`
      setup(YAML)
    })

    it('renders test YAML', () => {
      expect(screen.getByText(/max_report_age/)).toBeInTheDocument()
      expect(screen.getByText(/20/)).toBeInTheDocument()
    })
  })
})
