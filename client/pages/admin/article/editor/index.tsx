import { NextPage } from 'next';
import React from 'react';

import { ArticleEditor } from '@/components/ArticleEditor';
import { AdminLayout } from '@/layout/AdminLayout';

const Editor: NextPage = () => {
  return <AdminLayout>
    <ArticleEditor />
  </AdminLayout>
};

export default Editor;
