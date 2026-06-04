import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

function isApiConfigError(error: Error | null): boolean {
  if (!error) return false
  return (
    'code' in error && error.code === 'ERR_API_NOT_CONFIGURED'
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const apiError = isApiConfigError(this.state.error)

      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
          <div className="card bg-base-100 shadow-xl max-w-md w-full text-center p-8">
            <div className="text-error text-5xl mb-4">⚠</div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-base-content mb-3">
              {apiError ? 'Error de configuraci\u00f3n' : 'Algo sali\u00f3 mal'}
            </h1>

            {apiError ? (
              <div className="space-y-4">
                <p className="text-sm text-base-content/70 leading-relaxed">
                  La aplicaci\u00f3n no puede conectarse al API porque falta la variable de
                  entorno <code className="badge badge-outline badge-error font-mono text-xs">VITE_YGO_API_BASE_URL</code>.
                </p>
                <div className="alert alert-warning text-left text-xs">
                  <span>
                    <strong>Desarrollo:</strong> crea un archivo <code>.env.local</code> basado en{' '}
                    <code>.env.example</code>.
                    <br />
                    <strong>Producci\u00f3n:</strong> configura la variable en tu plataforma de
                    despliegue.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-base-content/70 leading-relaxed">
                  Ocurri\u00f3 un error inesperado. Tu inventario y decks est\u00e1n guardados en el
                  dispositivo y no se perdieron.
                </p>
                {this.state.error && (
                  <pre className="text-xs font-mono text-error bg-error/10 border border-error/20 rounded-sm p-3 text-left whitespace-pre-wrap break-all">
                    {this.state.error.message}
                  </pre>
                )}
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm uppercase tracking-wide mt-6"
              onClick={this.handleReset}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
