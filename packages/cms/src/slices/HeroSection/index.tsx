type HeroSectionLabels = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

type HeroSectionProps = {
  labels?: HeroSectionLabels;
};

export function HeroSection({ labels }: HeroSectionProps) {
  return (
    <section>
      <h1>{labels?.title}</h1>
      {labels?.subtitle ? <p>{labels.subtitle}</p> : null}
      <div>
        {labels?.primaryCta ? (
          <a href="/flight-search">{labels.primaryCta}</a>
        ) : null}
        {labels?.secondaryCta ? (
          <a href="/offers">{labels.secondaryCta}</a>
        ) : null}
      </div>
    </section>
  );
}

export default HeroSection;
