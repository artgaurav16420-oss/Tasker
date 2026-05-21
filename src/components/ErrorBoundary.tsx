import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; onRetry?: () => void }
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
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center p-8 dark:bg-slate-900">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 dark:bg-slate-800 border border-orange-100 dark:border-slate-700 flex items-center justify-center">
              <span className="text-orange-500 font-mono text-xl font-bold">!</span>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-slate-300 font-bold">
              Component Error
            </p>
            <p className="font-serif text-slate-500 text-base max-w-md dark:text-slate-300">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="mt-4 px-6 py-3 bg-emerald-500 text-slate-950 rounded-xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all duration-150"
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
