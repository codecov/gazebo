function DeactivateRepo() {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <h2 className="font-semibold">Deactivate repo</h2>
      <p>
        This must be done manually by removing the upload from your CI pipeline.
      </p>
    </div>
  )
}

export default DeactivateRepo
