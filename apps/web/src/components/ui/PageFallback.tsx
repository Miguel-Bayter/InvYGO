import { LoadingSpinner } from './LoadingSpinner'

export function PageFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <LoadingSpinner />
    </div>
  )
}
