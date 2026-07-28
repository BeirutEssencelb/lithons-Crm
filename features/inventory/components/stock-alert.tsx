import { AlertTriangle } from "lucide-react";

interface StockAlertProps {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    low_stock_threshold: number;
  }>;
}

export function StockAlert({ items }: StockAlertProps) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
      <div className="mb-3 flex items-center gap-2 text-amber-300">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="font-semibold">
          Low Stock Alert ({items.length} item{items.length > 1 ? "s" : ""})
        </h2>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="font-medium text-slate-200">{item.name}</span>
            <span className="text-amber-300">
              {item.quantity} / {item.low_stock_threshold}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
