import Link from './Link';

interface FooterProps {
  siteTitle: string;
}

export default function Footer({ siteTitle }: FooterProps) {
  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{siteTitle}</div>
          <div>{` • `}</div>
          <div>{`© ${new Date().getFullYear()}`}</div>
        </div>
        <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/">Powered by ReactPress</Link>
        </div>
      </div>
    </footer>
  );
}
