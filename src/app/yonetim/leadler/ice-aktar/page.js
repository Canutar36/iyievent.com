import { isDevPreview } from '@/lib/config'
import IceAktarClient from './IceAktarClient'

export const metadata = { title: 'Lead İçe Aktar | Yönetim' }

export default function IceAktarPage() {
  return <IceAktarClient demo={isDevPreview()} />
}
