export function Card({ children }) {
  return <div className="border rounded-lg shadow">{children}</div>;
}

export function CardContent({ children, className }) {
  return <div className={className}>{children}</div>;
}