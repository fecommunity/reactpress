import Link from 'next/link';
import React from 'react';

interface Tag {
  value: string;
  label: string;
  articleCount?: number;
}

interface TagsCloudProps {
  tags?: Tag[];
  currentTag?: string;
}

export default function TagsCloud({ tags, currentTag }: TagsCloudProps) {
  // Add safety check for tags array
  const safeTags = Array.isArray(tags) ? tags : [];
  
  return (
    <div className="tags-cloud">
      {safeTags.map((tag) => (
        <Link key={tag.value} href={`/tag/${tag.value}`}>
          <a 
            className={`tag-link ${currentTag === tag.value ? 'active' : ''}`}
            style={{ 
              fontSize: `${10 + Math.min((tag.articleCount || 0) / 3, 8)}px`,
              lineHeight: '1.4'
            }}
          >
            {tag.label}
          </a>
        </Link>
      ))}
      
      <style jsx>{`
        .tags-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.25rem 0;
        }

        .tag-link {
          display: inline-block;
          text-decoration: none;
          color: #4b5563;
          background: #f9fafb;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
          border: 1px solid #e5e7eb;
        }

        .tag-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .tag-link:hover,
        .tag-link.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
          border-color: transparent;
        }

        .tag-link:hover::before,
        .tag-link.active::before {
          opacity: 1;
        }

        .tag-link.active {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .tags-cloud {
            gap: 0.4rem;
          }

          .tag-link {
            padding: 0.2rem 0.65rem;
          }
        }

        @media (max-width: 480px) {
          .tags-cloud {
            gap: 0.35rem;
          }

          .tag-link {
            padding: 0.15rem 0.6rem;
          }
        }
      `}</style>
    </div>
  );
}