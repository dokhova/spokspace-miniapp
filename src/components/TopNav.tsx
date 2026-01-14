import { Link } from "react-router-dom";

export default function TopNav() {
  return (
    <nav style={{ padding: 16, display: "flex", gap: 12 }}>
      <Link to="/">Home</Link>
      <Link to="/pause">Pause</Link>
    </nav>
  );
}
