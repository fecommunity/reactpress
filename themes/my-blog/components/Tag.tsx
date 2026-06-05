interface TagProps {
  text: string;
}

export default function Tag({ text }: TagProps) {
  const slug = encodeURIComponent(text);
  return (
    <a
      href={`/tag/${slug}`}
      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mr-3 text-sm font-medium uppercase"
    >
      {text.split(' ').join('-')}
    </a>
  );
}
