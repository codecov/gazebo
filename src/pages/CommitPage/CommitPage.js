import { useParams } from 'react-router-dom'

import CoverageReportCard from './CoverageReportCard'
import UploadsCard from './UploadsCard'
import CommitsTable from './CommitsTable'
import Breadcrumb from 'ui/Breadcrumb'

function CommitPage() {
  const { owner, repo } = useParams()

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
            <UploadsCard />
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
