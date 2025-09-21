import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="copyright">
          &copy; {new Date().getFullYear()} Hello World Template. All rights reserved.
        </p>
      </div>
      
      <style jsx>{`
        .footer {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 2rem 0;
          margin-top: auto;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: center;
        }

        .copyright {
          margin: 0;
          font-size: 0.9rem;
          color: #d1d5db;
        }
      `}</style>
    </footer>
  );
}