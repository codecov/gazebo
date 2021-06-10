import Icon from 'ui/Icon'

function CoverageReportCard() {
  return (
    <div className="flex w-full p-4 flex-col border text-ds-gray-octonary">
      <span className="font-semibold text-base">Coverage report</span>
      <div className="flex mt-4 justify-between w-full">
        <div className="flex flex-col justify-center">
          <div className="flex mb-1 text-xs font-semibold">
            <span className="mr-2 text-ds-gray-quinary">HEAD</span>
            <span className="font-mono">a5042ed</span>
          </div>
          <span className="text-xl text-center font-light">79.50%</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-ds-gray-quinary text-xs font-semibold">
            Patch
          </span>
          <span className="text-xl text-center mt-1 font-light">79.50%</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-ds-gray-quinary text-xs font-semibold">
            Change
          </span>
          <span className="text-xl text-ds-primary-red text-center mt-1 font-light">
            -0.50
          </span>
        </div>
      </div>
      <div className="w-full text-ds-gray-quinary text-xs mt-4">
        The average coverage of changes for this commit is 81.50% (patch). Data
        source from comparing between{' '}
        <span className="font-mono text-ds-blue-darker">e7e936e</span> and{' '}
        <span className="font-mono">a5042ed</span>
      </div>
      <div className="mt-4 text-xs flex">
        <div className="flex items-center mr-7">
          <div className="text-ds-primary-green mr-1">
            <Icon size="sm" name="check" />
          </div>
          <span className="text-ds-blue-darker">CI Passed</span>
          <div className="text-ds-gray-quinary ml-0.5">
            <Icon size="sm" name="external-link" />
          </div>
        </div>
        <div className="flex items-center">
          <a className="mr-1 text-ds-blue-darker" href="pullid">
            #7457
          </a>
          (
          <a href="github" className="mr-0.5 text-ds-blue-darker">
            GitHub
          </a>
          <Icon size="sm" name="external-link" />)
        </div>
      </div>
    </div>
  )
}

export default CoverageReportCard
