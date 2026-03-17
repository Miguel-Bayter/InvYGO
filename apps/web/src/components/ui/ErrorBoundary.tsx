import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
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
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.icon}>⚠</div>
            <h1 className={styles.title}>Algo salió mal</h1>
            <p className={styles.message}>
              Ocurrió un error inesperado. Tu inventario y decks están guardados en el dispositivo y
              no se perdieron.
            </p>
            {this.state.error && <pre className={styles.detail}>{this.state.error.message}</pre>}
            <button className={styles.btn} onClick={this.handleReset}>
              Volver al inicio
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
