import A from 'ui/A'

function Overview() {
  return (
    <div className="flex w-2/5 flex-col">
      <div className="font-semibold text-3xl my-4">
        Let&apos;s get your repo covered
      </div>
      <div className="">
        Codecov requires an upload in your test suite to get started. Using the{' '}
        <A to={{ pageName: ' ' }}>Codecov Uploader</A> and the repository upload
        token, upload your coverage reports to Codecov. See our quick start
        guide to learn more.
      </div>
    </div>
  )
}

export default Overview
