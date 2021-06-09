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
        <div className="flex w-full mr-8 md:max-w-md flex-col">
          <div className="h-44 bg-ds-gray-octonary"></div>
          <div className="h-44 mt-2 md:mt-8 bg-ds-gray-octonary"></div>
        </div>
        <div className="h-96 w-full mt-2 md:mt-0 bg-ds-gray-secondary"></div>
      </div>
    </div>
  )
}

export default CommitPage
