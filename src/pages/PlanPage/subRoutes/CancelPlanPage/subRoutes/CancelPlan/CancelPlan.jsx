const { default: A } = require('ui/A')
const { default: Button } = require('ui/Button')
const { default: Icon } = require('ui/Icon')

function CancelPlan() {
  return (
    <div className="flex flex-col gap-8 w-5/12">
      <div className="">
        <h2 className="text-lg font-semibold">
          We&apos;d love to keep your under our umbrella.
        </h2>
        <p>
          Keep enjoying the features that help you analyze your code coverage
          quickly so you can deploy with confidence...for less.
        </p>
      </div>
      <p className="font-semibold">
        Get 30% off Codecov for 6 months! &#127881;
      </p>
      <div className="flex gap-4">
        <Button variant="primary" hook="apply-30-discount">
          Yes, I&apos;d like 6 months with 30% discount
        </Button>
        <A variant="blueSeptenary" to={{ pageName: 'downgradePlanPage' }}>
          No thanks, I&apos;ll proceed to the basic plan
          <Icon name="chevron-right" variant="solid" size="sm" />
        </A>
      </div>
      <p>
        Questions? <A to={{ pageName: 'sales' }}>Contact Sales</A>
      </p>
    </div>
  )
}

export default CancelPlan
