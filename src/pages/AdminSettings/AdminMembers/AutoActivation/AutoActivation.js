import Toggle from 'ui/Toggle'

function AutoActivation() {
  return (
    <div className="flex flex-col p-4 gap-2 border-2 border-ds-gray-primary mt-4">
      <div className="flex flex-row gap-2 items-center">
        <h3 className="font-semibold">Auto-activate members</h3>
        <Toggle />
      </div>
      <p>
        Users will automatically be assigned a Codecov seat if they 1 &rpar;
        author a pull request on a private repo, or 2 &rpar; log in to a private
        repo and if there are seats available in the subscription.
      </p>
    </div>
  )
}

export default AutoActivation
