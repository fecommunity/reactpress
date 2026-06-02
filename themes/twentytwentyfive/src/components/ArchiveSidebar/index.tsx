import AboutUs from '@components/AboutUs';
import { Categories } from '@components/Categories';
import React from 'react';

import { ArticleRecommend } from '@/components/ArticleRecommend';

interface ArchiveSidebarProps {
  categories: ICategory[];
  setting: ISetting;
  className?: string;
}

export const ArchiveSidebar: React.FC<ArchiveSidebarProps> = ({ categories, setting, className }) => (
  <div className="sticky">
    <ArticleRecommend mode="inline" deferFetch />
    <Categories categories={categories} />
    <AboutUs className={className} setting={setting} />
  </div>
);
