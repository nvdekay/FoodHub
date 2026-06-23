import { Card } from "../../components/ui";
import { cn } from "../../lib/cn";

const ACCENTS = {
  primary: "bg-primary/10 text-primary",
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-green-100 text-green-600",
};

/** Thẻ chỉ số KPI cho dashboard. */
export default function KpiCard({ icon: Icon, label, value, sub, accent = "primary" }) {
  return (
    <Card className="card-hover flex items-center gap-4 p-4">
      {Icon && (
        <span className={cn("flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl", ACCENTS[accent])}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs text-gray-500">{label}</p>
        <p className="truncate text-xl font-bold text-gray-800">{value}</p>
        {sub && <p className="truncate text-xs text-gray-400">{sub}</p>}
      </div>
    </Card>
  );
}
