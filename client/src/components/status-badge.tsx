import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "draft" | "confirmed" | "waiting" | "ready" | "in_progress" | "done" | "delivered" | "received" | "canceled" | "paused" | "pending";

const statusConfig: Record<StatusType, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  draft: { label: "Draft", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "default", className: "bg-blue-500 hover:bg-blue-600 text-white" },
  waiting: { label: "Waiting", variant: "outline", className: "border-amber-500 text-amber-700 dark:text-amber-400" },
  ready: { label: "Ready", variant: "default", className: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  in_progress: { label: "In Progress", variant: "default", className: "bg-indigo-500 hover:bg-indigo-600 text-white" },
  done: { label: "Done", variant: "default", className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  delivered: { label: "Delivered", variant: "default", className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  received: { label: "Received", variant: "default", className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  canceled: { label: "Canceled", variant: "destructive" },
  paused: { label: "Paused", variant: "outline", className: "border-orange-500 text-orange-700 dark:text-orange-400" },
  pending: { label: "Pending", variant: "outline", className: "border-slate-500 text-slate-700 dark:text-slate-400" },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <Badge 
      variant={config.variant}
      className={cn("text-xs", config.className)}
    >
      {config.label}
    </Badge>
  );
}
