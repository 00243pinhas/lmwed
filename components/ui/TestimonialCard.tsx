import Image from 'next/image';

type Props = {
  quote: string;
  name: string;
  city: string;
  year: string;
  dress: string;
  collection: string;
  image?: string;
  featured?: boolean;
};

export function TestimonialCard({
  quote,
  name,
  city,
  year,
  dress,
  collection,
  image,
  featured = false,
}: Props) {
  if (featured) {
    return (
      <div className="flex flex-col items-center text-center gap-lg md:gap-xl max-w-[720px] mx-auto">
        <p className="font-display italic font-light text-display-xs md:text-display-md text-white leading-[1.5]">
          &ldquo;{quote}&rdquo;
        </p>
        <p className="font-body text-[9px] uppercase tracking-[0.14em] text-accent">
          {name} — {city} · {year} · {dress}, {collection}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      {image && (
        <div className="relative h-16 w-16 overflow-hidden">
          <Image src={image} alt={`${name}, LM Weddyli bride`} fill className="object-cover" />
        </div>
      )}
      <p className="font-display italic text-[17px] text-ink leading-[1.5]">&ldquo;{quote}&rdquo;</p>
      <p className="font-body text-[9px] uppercase tracking-[0.14em] text-muted">
        {name} — {city} · {year} · {dress}, {collection}
      </p>
    </div>
  );
}
