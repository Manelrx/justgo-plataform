import React, { Component, ErrorInfo, ReactNode } from 'react';
import { COLORS } from '@pdv-jgm/design-system';

/**
 * FAILSAFE MECHANISM:
 * If the Design System fails to load (e.g., runtime token error),
 * we fallback to this hardcoded Safe Mode UI.
 * 
 * DESIGN RULES:
 * - Error Text: #c62828 (Critical)
 * - Background: #ffffff (Pure White - indicating degradation)
 * - NO OTHER HARDCODED COLORS ALLOWED.
 */
interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class DesignSystemErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // CRITICAL: Log error to console - this is NOT a silent recovery
        console.error('CRITICAL: Design System Token Failure. Entering Safe Mode.', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff', // FALLBACK: Pure White (Degraded State)
                    color: '#000000', // FALLBACK: Black
                    fontFamily: 'sans-serif'
                }}>
                    <h1 style={{ color: '#c62828' }}>SISTEMA EM MODO DE SEGURANÇA</h1>
                    <p>Falha crítica ao carregar Design System.</p>
                    <pre style={{
                        backgroundColor: '#eee',
                        padding: '1rem',
                        borderRadius: '4px',
                        maxWidth: '80%',
                        overflow: 'auto'
                    }}>
                        {this.state.error?.message}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

function PdvApp() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: COLORS.brand.background,
            fontFamily: 'sans-serif'
        }}>
            <header style={{
                backgroundColor: COLORS.brand.dark,
                padding: '1.5rem',
                color: COLORS.brand.primary,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `2px solid ${COLORS.brand.primary}`
            }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>PDV Autônomo</h1>
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: COLORS.semantic.success // Status Online
                }} />
            </header>

            <main style={{
                flex: 1,
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.text.onBackground
            }}>
                <h2 style={{ color: COLORS.text.onBackground }}>Caixa Livre</h2>
                <p style={{ opacity: 0.8 }}>Aguardando leitura de código de barras...</p>

                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    border: `1px dashed ${COLORS.semantic.disabled}`,
                    borderRadius: '8px',
                    color: COLORS.semantic.disabled
                }}>
                    Simulação de Leitor (Offline)
                </div>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <DesignSystemErrorBoundary>
            <PdvApp />
        </DesignSystemErrorBoundary>
    );
}
