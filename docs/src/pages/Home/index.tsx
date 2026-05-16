import React from 'react';

import Hero from '@site/src/pages/Home/Hero';
import Highlights from '@site/src/pages/Home/Highlights';
import CallToAction from '@site/src/pages/Home/CallToAction';

export default function Home() {
  return (
    <>
      <Hero />
      <Highlights />
      <CallToAction />
    </>
  );
}
