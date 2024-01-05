import Button from 'ui/Button'

function ATSNotConfigured() {
  return (
    <div className="flex flex-col justify-evenly gap-3 space-y-7 bg-ds-gray-primary px-4 py-6">
      <h1 className="text-xl font-semibold">
        Automated Test Selection Not Yet Configured
      </h1>
      <h2 className="text-lg font-semibold">
        {`\u{1F680}`} Ready to Accelerate Your CI/CD Pipeline?
      </h2>
      <div>
        <p>Automated Test Selection is waiting to be set up!</p>
        <ul className="list-disc pl-6">
          <li>Run only necessary tests per pull request.</li>
          <li>Cut down on developer wait times.</li>
          <li>Speed up your time to deployment.</li>
          <li>Save on CI/CD build costs.</li>
        </ul>
        <p className="text-xs">
          * Currently available for Python, with more languages coming soon.
        </p>
      </div>
      <div className="max-w-[30%]">
        <Button
          to={{ pageName: 'staticAnalysisDoc' }}
          variant="primary"
          disabled={false}
          hook={'read-ats-documentation'}
          showExternalIcon={false}
        >
          Read the Documentation and Set Up
        </Button>
      </div>
    </div>
  )
}

export default ATSNotConfigured
