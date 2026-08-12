import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const { signin, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isRegister) {
        await register(form)
      } else {
        await signin({ email: form.email, password: form.password })
      }
      navigate(location.state?.from || '/tickets', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {isRegister && (
        <>
          <label>
            Name
            <input name="name" autoComplete="name" value={form.name} onChange={updateField} required minLength={2} />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={updateField} />
          </label>
        </>
      )}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={form.password}
          onChange={updateField}
          required
          minLength={8}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
      </button>
      <p className="form-switch">
        {isRegister ? 'Already registered?' : 'New to Dhaka Zoo?'}{' '}
        <Link to={isRegister ? '/signin' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
      </p>
    </form>
  )
}

export default AuthForm
