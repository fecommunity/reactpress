export default function Footer() {
  return (
    <footer className="footer">
      <p>
        Powered by{' '}
        <a href="https://github.com/fecommunity/reactpress" rel="noopener noreferrer">
          ReactPress
        </a>
      </p>
      <style jsx>{`
        .footer {
          margin-top: auto;
          padding: 2rem 0 2.5rem;
          font-size: 0.8125rem;
          color: #999;
        }

        .footer p {
          margin: 0;
        }

        .footer a {
          color: var(--rp-primary, #c02b5a);
          text-decoration: underline;
          text-underline-offset: 0.15em;
        }

        .footer a:hover {
          color: #9a2349;
        }
      `}</style>
    </footer>
  );
}
