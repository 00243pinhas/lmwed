import type { ActivityItem } from '@/types/dashboard';

function formatWhen(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="font-body text-[14px] text-muted rounded-sm border-hairline border-border-l bg-white px-lg py-md">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="rounded-sm border-hairline border-border-l bg-white shadow-card">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`px-lg py-md flex items-center justify-between gap-md ${
            index !== items.length - 1 ? 'border-b-hairline border-border-l' : ''
          }`}
        >
          <p className="font-body text-[14px] text-ink">{item.description}</p>
          <p className="font-body text-[12px] text-muted whitespace-nowrap tabular-nums">
            {formatWhen(item.timestamp)}
          </p>
        </div>
      ))}
    </div>
  );
}
