import React from 'react';

import Hero from '@site/src/components/Home/Hero';
import Highlights from '@site/src/components/Home/Highlights';
import CallToAction from '@site/src/components/Home/CallToAction';

export default function Home() {
  return (
    <>
      <Hero />
      <Highlights />
      <CallToAction />
    </>
  );
}
