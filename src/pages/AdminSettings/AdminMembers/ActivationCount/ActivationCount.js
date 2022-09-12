function ActivationCount() {
  return (
    <div className="flex flex-col p-4 gap-2 border-2 border-ds-gray-primary mt-4">
      <h3 className="font-semibold">Activation count </h3>
      <p>
        <span className="font-semibold text-lg">0</span> active members of{' '}
        <span className="font-semibold text-lg">0</span> available seats
      </p>
    </div>
  )
}

export default ActivationCount
