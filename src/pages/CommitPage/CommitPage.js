import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Modal from 'ui/Modal'
import CoverageReportCard from './CoverageReportCard'
import UploadsCard from './UploadsCard'
import CommitsTable from './CommitsTable'
import Breadcrumb from 'ui/Breadcrumb'
import YAMLViewer from './YAMLViewer'
const exampleCode = `
codecov:\n  max_report_age: false\n  require_ci_to_pass: true\ncomment:\n  behavior: default\n  layout: reach,diff,flags,tree,reach\n  show_carryforward_flags: false\ncoverage:\n  precision: 2\n  range:\n  - 70.0\n  - 100.0\n  round: down\n  status:\n    changes: false\n    default_rules:\n      flag_coverage_not_uploaded_behavior: include\n    patch: true\n    project: true\ngithub_checks:\n  annotations: true\n
`

function CommitPage() {
  const { owner, repo } = useParams()
  const [showYAMLModal, setShowYAMLModal] = useState(false)

  return (
    <div className="flex flex-col">
      <div className="w-full flex border-b border-ds-gray-secondary pb-3">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
            { pageName: 'commits' },
            { pageName: 'a675fas', readOnly: true, text: 'a675fas' },
          ]}
        />
      </div>
      <span className="mt-4 text-lg font-semibold text-ds-gray-octonary">
        Update Graphql mutation
      </span>
      <div className="flex mt-1 text-ds-gray-">
        2 hours ago Pierce-m authored commit
        <a className="ml-1.5" href="somethinf">
          jsdfhjksd
        </a>
      </div>
      <hr className="mt-6" />
      <div className="flex flex-col md:flex-row mt-8">
        <div className="flex w-full mr-8 md:max-w-sm flex-col">
          <div className="">
            <CoverageReportCard />
          </div>
          <div className="mt-2 md:mt-8">
            <UploadsCard
              showYAMLModal={showYAMLModal}
              setShowYAMLModal={setShowYAMLModal}
            />
            {showYAMLModal && (
              <Modal
                isOpen={true}
                onClose={() => setShowYAMLModal(false)}
                title="Yaml"
                body={<YAMLViewer YAML={exampleCode} />}
                footer={
                  <span className="text-sm w-full text-left">
                    Includes default yaml, global yaml, and repo{' '}
                    <a href="learnmore" className="text-ds-blue-darker">
                      learn more
                    </a>
                  </span>
                }
              />
            )}
          </div>
        </div>
        <div className="flex flex-col w-full mt-2 md:mt-0">
          <span className="text-base mb-4 font-semibold">Impacted files</span>
          <CommitsTable />
        </div>
      </div>
    </div>
  )
}

export default CommitPage
