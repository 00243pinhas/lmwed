import { StatusPill, type PillTone } from '@/components/dashboard/StatusPill';
import type { Dress, DressStatus } from '@/types/dress';

const STATUS_CONFIG: Record<DressStatus, { label: string; tone: PillTone }> = {
  available: { label: 'Available', tone: 'ok' },
  rented: { label: 'Rented', tone: 'neutral' },
  retired: { label: 'Retired', tone: 'muted' },
};

function formatPrice(price: number) {
  return `$${Math.round(Number(price))}`;
}

export function DressesTable({ dresses }: { dresses: Dress[] }) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto rounded-sm border-hairline border-border-l bg-white shadow-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-hairline border-border-l">
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Name
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Size
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Rental Price
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {dresses.map((dress) => {
              const config = STATUS_CONFIG[dress.status];
              return (
                <tr
                  key={dress.id}
                  className="border-b-hairline border-border-l last:border-b-0 hover:bg-light transition-colors duration-ui ease-standard"
                >
                  <td className="px-lg py-md font-body text-[14px] text-ink">{dress.name}</td>
                  <td className="px-lg py-md font-body text-[14px] text-ink">
                    {dress.size ?? '—'}
                  </td>
                  <td className="px-lg py-md font-body text-[14px] text-ink tabular-nums">
                    {formatPrice(dress.rental_price)}
                  </td>
                  <td className="px-lg py-md">
                    <StatusPill label={config.label} tone={config.tone} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-md">
        {dresses.map((dress) => {
          const config = STATUS_CONFIG[dress.status];
          return (
            <div
              key={dress.id}
              className="rounded-sm border-hairline border-border-l bg-white shadow-card px-lg py-md flex flex-col gap-xs"
            >
              <div className="flex items-center justify-between gap-md">
                <p className="font-body text-[14px] text-ink">{dress.name}</p>
                <StatusPill label={config.label} tone={config.tone} />
              </div>
              <p className="font-body text-[12px] text-muted">
                Size {dress.size ?? '—'} · {formatPrice(dress.rental_price)}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
