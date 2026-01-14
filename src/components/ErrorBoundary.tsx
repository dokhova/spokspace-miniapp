import type { ReactNode } from "react";
import { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/system.css";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("UI crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="system-page">
          <h1 className="system-title">Something went wrong</h1>
          <p className="system-text">We already logged the issue.</p>
          <Link className="system-link" to="/today">
            Back to Home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
