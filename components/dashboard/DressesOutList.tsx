import { StatusPill } from '@/components/dashboard/StatusPill';
import type { ActiveRentalSummary } from '@/types/dashboard';

function isOverdue(dueDate: string) {
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

export function DressesOutList({ rentals }: { rentals: ActiveRentalSummary[] }) {
  if (rentals.length === 0) {
    return (
      <p className="font-body text-[14px] text-muted rounded-sm border-hairline border-border-l bg-white px-lg py-md">
        No dresses out right now.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-xs">
      {rentals.map((rental) => {
        const overdue = isOverdue(rental.due_date);
        return (
          <div
            key={rental.id}
            className="rounded-sm border-hairline border-border-l bg-white shadow-card px-lg py-md flex items-center justify-between gap-md"
          >
            <div>
              <p className="font-body text-[14px] text-ink">{rental.dress_name}</p>
              <p className="font-body text-[12px] text-muted">{rental.client_name}</p>
            </div>
            <div className="flex items-center gap-md">
              <p className="font-body text-[12px] text-muted tabular-nums">Due {rental.due_date}</p>
              <StatusPill label={overdue ? 'Overdue' : 'Active'} tone={overdue ? 'alert' : 'ok'} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
