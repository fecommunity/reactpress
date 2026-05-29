interface TaxonomyHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export default function TaxonomyHero({ title, subtitle, backgroundImage }: TaxonomyHeroProps) {
  return (
    <header
      className="taxonomy-hero"
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})` }
          : undefined
      }
    >
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}
