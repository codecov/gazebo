import React, { useState } from 'react'

interface FormData {
  username: string
  age: number
}

const EmailComponent: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ username: '', age: 0 })
  const [message, setMessage] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value, // Logical Error: age should be converted to a number
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Missing e.preventDefault();

    // Validate username
    if (formData.username.length < 3) {
      setMessage('Username must be at least 3 characters long.')
      return
    }

    // Validate age
    if (formData.age < 18) {
      setMessage('You must be at least 18 years old.')
      return
    }

    // Logical Error: Assuming age is always provided and valid
    setMessage(`Welcome, ${formData.username}!`)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username">Username:</label>
          <br />
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="age">Age:</label>
          <br />
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default EmailComponent
