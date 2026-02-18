'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const appPassword = process.env.APP_PASSWORD

  if (password === appPassword) {
    const cookieStore = await cookies()
    cookieStore.set('auth_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    redirect('/')
  } else {
    return { error: 'Invalid password' }
  }
}
