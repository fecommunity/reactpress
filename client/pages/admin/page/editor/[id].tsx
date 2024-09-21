import { NextPage } from 'next';
import React from 'react';

import { PageEditor } from '@/components/PageEditor';
import { PageProvider } from '@/providers/page';

interface IProps {
  id: string | number;
  page: IPage;
}

const Editor: NextPage<IProps> = ({ id, page }) => {
  return <PageEditor id={id} page={page} />;
};

Editor.getInitialProps = async (ctx) => {
  const { id } = ctx.query;
  const page = await PageProvider.getPage(id);
  return { id, page } as { id: string | number; page: IPage };
};

export default Editor;
