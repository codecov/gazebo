function RandomComponent() {
  const test = window.test.truc

  return 'bro' + test
}

export default function BreakingPage() {
  return (
    <div>
      <RandomComponent />
    </div>
  )
}
