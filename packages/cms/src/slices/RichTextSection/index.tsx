type RichTextSectionProps = {
  title?: string;
  description?: string;
};

export function RichTextSection({ title, description }: RichTextSectionProps) {
  return (
    <section>
      {title ? <h2>{title}</h2> : null}
      {description ? <p>{description}</p> : null}
    </section>
  );
}

export default RichTextSection;
