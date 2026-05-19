import { Component, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null; resetKey: number }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, resetKey: 0 };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState((prev) => ({ hasError: false, error: null, resetKey: prev.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
              <span className="text-orange-500 font-mono text-xl font-bold">!</span>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 font-bold">
              Component Error
            </p>
            <p className="font-serif text-slate-500 text-base max-w-md">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="mt-4 px-6 py-3 bg-emerald-500 text-slate-950 rounded-xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return <div key={this.state.resetKey}>{this.props.children}</div>;
  }
}
