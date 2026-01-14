import "../styles/system.css";

type LoadingProps = {
  label?: string;
};

export function Loading({ label = "Loading..." }: LoadingProps) {
  return (
    <div className="loading">
      <div className="loading__spinner" aria-hidden="true" />
      <div className="loading__text">{label}</div>
      <div className="skeleton">
        <div className="skeleton__line" />
        <div className="skeleton__line skeleton__line--short" />
        <div className="skeleton__card" />
      </div>
    </div>
  );
}
