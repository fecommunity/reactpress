import Link from '@/components/Link';
import Logo from '@/data/logo.svg';

export interface NavLink {
  href: string;
  title: string;
}

interface HeaderProps {
  siteTitle: string;
  navLinks: NavLink[];
  stickyNav?: boolean;
}

export default function Header({ siteTitle, navLinks, stickyNav = false }: HeaderProps) {
  let headerClass =
    'flex items-center w-full bg-white dark:bg-gray-950 justify-between py-10';
  if (stickyNav) {
    headerClass += ' sticky top-0 z-50';
  }

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={siteTitle}>
        <div className="flex items-center justify-between">
          <div className="mr-3">
            <Logo />
          </div>
          <div className="hidden h-6 text-2xl font-semibold sm:block">{siteTitle}</div>
        </div>
      </Link>
      <div className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6">
        <div className="no-scrollbar hidden max-w-40 items-center gap-x-4 overflow-x-auto sm:flex md:max-w-72 lg:max-w-96">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary-500 dark:hover:text-primary-400 m-1 font-medium text-gray-900 dark:text-gray-100"
            >
              {link.title}
            </Link>
          ))}
        </div>
        <Link href="/search" aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="hover:text-primary-500 dark:hover:text-primary-400 h-6 w-6 text-gray-900 dark:text-gray-100"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
}
