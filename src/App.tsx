import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";

import Home from "./pages/Home";
import Practices from "./pages/Practices";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Metrics from "./pages/Metrics";
import PracticeDetail from "./pages/practices/PracticeDetail";
import PracticePlayer from "./pages/practices/PracticePlayer";

export default function App() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/practice/:id/play" element={<PracticePlayer />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<Home />} />
            <Route path="/practices" element={<Practices />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/practice/:id" element={<PracticeDetail />} />
            <Route path="/game" element={<Game />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
