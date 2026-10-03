import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Resilient Error Boundary
 * Catches JS errors in any child component tree and renders a
 * styled fallback instead of white-screening the entire app.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[FlightGlobe] Error Boundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-red-500/30 bg-slate-900/80 backdrop-blur-sm shadow-xl"
        >
          <AlertTriangle
            size={36}
            className="text-red-400 mb-3"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-white mb-1">
            {this.props.title || "Module Anomaly Detected"}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mb-4">
            {this.props.message ||
              "This component encountered an unexpected error. You can reboot it or refresh the page."}
          </p>
          {this.props.showError && this.state.error && (
            <pre className="text-xs text-red-300 bg-red-900/20 rounded-xl p-3 mb-4 max-w-sm overflow-x-auto text-left font-mono">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Reboot Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
