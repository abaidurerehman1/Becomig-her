import { useId, useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { ArrowIcon } from './Icons'

type Source = 'hero' | 'founding'

type Props = {
  source: Source
  buttonLabel: string
  tone?: 'light' | 'dark'
}

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; firstName: string; alreadyJoined: boolean }
  | { kind: 'error'; message: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function WaitlistForm({ source, buttonLabel, tone = 'light' }: Props) {
  const id = useId()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ firstName?: string; email?: string }>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  function validate() {
    const next: typeof errors = {}
    if (!firstName.trim()) next.firstName = 'Please enter your first name.'
    if (!email.trim()) next.email = 'Please enter your email.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status.kind === 'submitting' || !validate()) return
    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName.trim(), email: email.trim(), source }),
      })
      if (res.status === 422) {
        setErrors({ email: 'Please check your details and try again.' })
        setStatus({ kind: 'idle' })
        return
      }
      if (!res.ok) throw new Error()
      const data: { first_name: string; already_joined: boolean } = await res.json()
      setStatus({ kind: 'success', firstName: data.first_name, alreadyJoined: data.already_joined })
    } catch {
      setStatus({
        kind: 'error',
        message: 'Something went wrong while saving your spot. Please try again in a moment.',
      })
    }
  }

  if (status.kind === 'success') {
    return (
      <div className={`thanks thanks--${tone}`} role="status" aria-live="polite">
        {status.alreadyJoined ? (
          <>
            <h3 className="thanks__title">
              You’re already on the list, <em>{status.firstName}</em>.
            </h3>
            <p>
              Your spot — and your Founding Member rate of <strong>$12/month</strong> — is
              saved. We’ll reach out the moment doors open.
            </p>
          </>
        ) : (
          <>
            <h3 className="thanks__title">
              Welcome, <em>{status.firstName}</em>. You’re on the list.
            </h3>
            <p>
              Your Founding Member rate of <strong>$12/month</strong> is reserved for you,
              locked in for as long as you remain a member.
            </p>
            <p>
              Keep an eye on your inbox. You’ll be among the first invited when Becoming HER opens
              its doors.
            </p>
            <p className="thanks__sign">Your becoming starts here.</p>
          </>
        )}
      </div>
    )
  }

  const busy = status.kind === 'submitting'
  const nameErrId = `${id}-name-err`
  const emailErrId = `${id}-email-err`

  return (
    <form className={`waitlist waitlist--${tone}`} onSubmit={onSubmit} noValidate>
      <div className="waitlist__bar" data-invalid={!!(errors.firstName || errors.email)}>
        <TextField
          id={`${id}-name`}
          label="First name"
          placeholder="Your first name"
          type="text"
          autoComplete="given-name"
          maxLength={80}
          value={firstName}
          errorId={errors.firstName ? nameErrId : undefined}
          onChange={(v) => {
            setFirstName(v)
            if (errors.firstName) setErrors((e) => ({ ...e, firstName: undefined }))
          }}
        />
        <TextField
          id={`${id}-email`}
          label="Email"
          placeholder="you@example.com"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={255}
          value={email}
          errorId={errors.email ? emailErrId : undefined}
          onChange={(v) => {
            setEmail(v)
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }))
          }}
        />
        <button className="btn btn--primary waitlist__btn" type="submit" disabled={busy}>
          {busy ? 'Saving your spot…' : buttonLabel}
          {!busy && <ArrowIcon />}
        </button>
      </div>

      {(errors.firstName || errors.email) && (
        <div className="waitlist__errors" role="alert">
          {errors.firstName && <p id={nameErrId}>{errors.firstName}</p>}
          {errors.email && <p id={emailErrId}>{errors.email}</p>}
        </div>
      )}
      {status.kind === 'error' && (
        <p className="waitlist__error" role="alert">
          {status.message}
        </p>
      )}
    </form>
  )
}

type TextFieldProps = {
  id: string
  label: string
  value: string
  /** Set when the field is invalid; points at the message rendered below the bar. */
  errorId?: string
  onChange: (value: string) => void
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'inputMode' | 'autoComplete' | 'maxLength' | 'placeholder'
>

function TextField({ id, label, value, errorId, onChange, ...input }: TextFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        {...input}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!errorId}
        aria-describedby={errorId}
      />
    </div>
  )
}
