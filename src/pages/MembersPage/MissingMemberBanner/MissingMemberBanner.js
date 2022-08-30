import Banner from 'ui/Banner'

//no need for this to live in it's own file anymore
function MissingMemberBanner() {
  return (
    <Banner heading={<h2 className="font-semibold">Don’t see a member?</h2>}>
      It may be because they haven’t logged into Codecov yet. Please make sure
      they log into Codecov first
    </Banner>
  )
}

export default MissingMemberBanner
