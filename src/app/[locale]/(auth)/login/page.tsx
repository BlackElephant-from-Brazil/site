import { setRequestLocale } from 'next-intl/server'
import LoginContent from './LoginContent'

type Params = Promise<{ locale: string }>

export default async function LoginPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <LoginContent />
}
