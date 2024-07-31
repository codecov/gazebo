import TokenWrapper from 'ui/TokenWrapper'

function ValidateYaml() {
  return (
    <div className="flex flex-col gap-4 xl:w-3/4">
      <h3 className="font-semibold">Validate the YAML</h3>
      <p>
        Use this shell script to post your YAML to Codecov to be checked for
        syntax and layout issues.
      </p>
      <TokenWrapper token="cat codecov.yml | curl --data-binary @- https://codecov.io/validate" />
    </div>
  )
}

export default ValidateYaml
