import Logo from 'assets/athena_logo.png'

export default function LoadingLogo() {
  return (
    <span className="relative flex size-20">
      <span className="bg-ds-pink absolute inline-flex size-full rounded-full opacity-50 motion-safe:animate-ping"></span>
      <span className="relative inline-flex size-20 justify-center rounded-full bg-white">
        <img className="p-1" src={Logo} alt="Athena Logo" />
      </span>
    </span>
  )
}
