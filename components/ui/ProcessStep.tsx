import Image from 'next/image';

type Props = {
  number: string;
  title: string;
  description: string;
  eyebrow?: string;
  image?: string;
  imageAlt?: string;
  imageLeft?: boolean;
};

export function ProcessStep({
  number,
  title,
  description,
  eyebrow,
  image,
  imageAlt,
  imageLeft = false,
}: Props) {
  return (
    <div className="border-t border-hairline border-border-l py-2xl md:py-3xl">
      <div className="flex flex-col md:flex-row md:items-center md:gap-2xl">
        <p className="font-display font-light text-[80px] md:text-[120px] leading-none text-[#E8E2DA] md:w-[180px] md:shrink-0">
          {number}
        </p>

        <div
          className={`mt-md flex flex-1 flex-col gap-lg md:mt-0 md:flex-row md:items-center md:gap-2xl ${
            imageLeft ? 'md:flex-row-reverse' : ''
          }`}
        >
          <div className="md:flex-1">
            {eyebrow && (
              <p className="font-body text-[9px] uppercase tracking-[0.14em] text-muted">{eyebrow}</p>
            )}
            <h3 className="font-display font-light text-display-sm md:text-display-xs text-ink mt-xs">
              {title}
            </h3>
            <p className="font-body text-body text-muted mt-sm max-w-[42ch]">{description}</p>
          </div>

          {image && (
            <div className="relative aspect-[4/3] w-full md:flex-1">
              <Image
                src={image}
                alt={imageAlt ?? title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
