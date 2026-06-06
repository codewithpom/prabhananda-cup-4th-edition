import React from 'react';

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Readonly<Props>;
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-8">
          <div className="border border-red-500/30 bg-red-500/10 p-6 max-w-lg w-full">
            <h1 className="text-red-500 font-mono text-sm uppercase tracking-widest mb-3">
              Application Error
            </h1>
            <pre className="text-white/70 text-xs overflow-auto whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
