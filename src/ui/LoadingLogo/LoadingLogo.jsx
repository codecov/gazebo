import Logo from 'assets/athena_logo.png'

export default function LoadingLogo() {
  return (
    <span className="relative flex h-20 w-20">
      <span className="absolute inline-flex h-full w-full rounded-full bg-ds-pink opacity-50 motion-safe:animate-ping"></span>
      <span className="relative inline-flex h-20 w-20 justify-center rounded-full bg-white">
        <img className="p-1" src={Logo} alt="Athena Logo" />
      </span>
    </span>
  )
}
