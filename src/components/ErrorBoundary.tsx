import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.componentName || "View"} failed:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[360px] flex items-center justify-center p-4 sm:p-6 my-auto">
          <div className="max-w-lg w-full bg-slate-900/95 border border-rose-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md text-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-rose-300 font-sans tracking-wide">
                  {this.props.fallbackTitle || "Görünüm Yüklenirken Bir Sorun Oluştu"}
                </h3>
                <p className="text-xs text-slate-400 font-mono truncate">
                  Modül: {this.props.componentName || "Bileşen Katmanı"}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Beklenmeyen bir arayüz uyumsuzluğu yakalandı ve diğer sistemler koruma altına alındı. Bu görünümü yeniden başlatabilir veya ana merkeze dönebilirsiniz.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Görünümü Yeniden Başlat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    window.location.hash = "";
                    window.location.reload();
                  } catch {
                    this.handleReset();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-white/10 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ana Sayfa</span>
              </button>

              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="ml-auto text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition-colors"
              >
                <span>{this.state.showDetails ? "Gizle" : "Detaylar"}</span>
                {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Collapsible Error Trace */}
            {this.state.showDetails && this.state.error && (
              <div className="p-3 bg-slate-950/90 rounded-xl border border-white/10 text-slate-400 text-[11px] font-mono overflow-x-auto max-h-48 space-y-1">
                <div className="text-rose-400 font-bold break-all">
                  {this.state.error.name}: {this.state.error.message}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-slate-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary as SafeErrorBoundary };
export default ErrorBoundary;
