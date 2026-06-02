import AboutUs from '@components/AboutUs';
import { ArticleRecommend } from '@/components/ArticleRecommend';
import { Tags } from '@/components/Tags';
import React from 'react';

interface HomeSidebarProps {
  tags: ITag[];
  setting: ISetting;
  className?: string;
}

export const HomeSidebar: React.FC<HomeSidebarProps> = ({ tags, setting, className }) => (
  <div className="sticky">
    <ArticleRecommend mode="inline" deferFetch />
    <Tags tags={tags} />
    <AboutUs className={className} setting={setting} />
  </div>
);
