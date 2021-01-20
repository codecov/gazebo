import { useForm } from 'react-hook-form'

import { useUser } from 'services/user'
import Card from 'ui/Card'
import Button from 'ui/Button'
import TextInput from 'ui/TextInput'

function NameEmailCard() {
  const { register, handleSubmit } = useForm()
  const { data: user } = useUser()

  function submit(...args) {
    console.log(args)
  }

  return (
    <Card className="p-10">
      {/* Define the field first and the submit/title after so the TAB order makes sense for accessibility but we reverse the two so it looks like the correct UI */}
      <form onSubmit={handleSubmit(submit)} className="flex flex-col-reverse">
        <div className="flex justify-between mt-8 flex-col md:flex-row">
          <div className="w-full md:w-1/2 mr-2">
            <label htmlFor="name-edit" className="bold">
              Name
            </label>
            <TextInput
              id="name-edit"
              className="mt-2"
              name="name"
              defaultValue={user.name}
              ref={register}
            />
          </div>
          <div className="w-full md:w-1/2 ml-2 mt-4 md:mt-0">
            <label htmlFor="email-edit" className="bold">
              Email
            </label>
            <TextInput
              id="email-edit"
              className="mt-2"
              name="email"
              defaultValue={user.email}
              ref={register}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl bold">Your details</h1>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Card>
  )
}

export default NameEmailCard
