import { Link } from "react-router-dom";
import { Card } from "../ui";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <span className="text-3xl">🍵</span> FoodHub
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-800">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <Card className="p-6">{children}</Card>
        {footer && <p className="mt-4 text-center text-sm text-gray-500">{footer}</p>}
      </div>
    </div>
  );
}
