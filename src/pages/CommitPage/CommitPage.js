import CoverageReportCard from './CoverageReportCard'
import UploadsCard from './UploadsCard'
import CommitsTable from './CommitsTable'

function CommitPage() {
  return (
    <div className="flex flex-col">
      <span className="w-full border-b border-ds-gray-secondary pb-3">
        Febg/repo-test/Commits/jsdfhjksd
      </span>
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
