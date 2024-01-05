import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

const ATSConfigured: React.FC = () => {
  return (
    <div className="flex flex-col justify-evenly gap-4 space-y-7 bg-ds-gray-primary p-6">
      <span className="flex flex-row space-x-2">
        <div className="text-green-500">
          <Icon name="checkCircle" />
        </div>
        <div>
          <h1 className="text-base font-semibold">
            Automated Test Selection Configured
          </h1>
        </div>
        <p className="flex max-h-4 rounded bg-ds-pink-tertiary px-2 text-xs font-semibold text-white">
          BETA
        </p>
      </span>
      <p>
        {`\u{1F50A}`} <strong>Questions and feedback?</strong> Let us know your
        thoughts&nbsp;
        <A
          to={{ pageName: 'feedback' }}
          hook={undefined}
          isExternal={undefined}
        >
          here
        </A>
        .
      </p>
      <div className="w-1/5">
        <Button
          to={{ pageName: 'staticAnalysisDoc' }}
          variant="primary"
          disabled={false}
          hook={'read-ats-documentation'}
          showExternalIcon={false}
        >
          Read Documentation
        </Button>
      </div>
    </div>
  )
}

export default ATSConfigured
