import Card from 'ui/Card'
import Button from 'ui/Button'
import TextInput from 'ui/TextInput'

function NameEmailCard() {
  return (
    <Card className="p-10">
      <form>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl bold">Your details</h1>
          <Button type="submit">Save changes</Button>
        </div>
        <div className="flex justify-between mt-8 flex-col md:flex-row">
          <div className="w-full md:w-1/2 mr-2">
            <label htmlFor="name-edit" className="bold">
              Name
            </label>
            <TextInput id="name-edit" className="mt-2" />
          </div>
          <div className="w-full md:w-1/2 ml-2 mt-4 md:mt-0">
            <label htmlFor="email-edit" className="bold">
              Email
            </label>
            <TextInput id="email-edit" className="mt-2" />
          </div>
        </div>
      </form>
    </Card>
  )
}

export default NameEmailCard
