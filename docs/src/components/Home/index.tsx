import CallToAction from '@site/src/components/Home/CallToAction';
import Hero from '@site/src/components/Home/Hero';
import Highlights from '@site/src/components/Home/Highlights';
import StatsBar from '@site/src/components/Home/StatsBar';
import React from 'react';

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Highlights />
      <CallToAction />
    </>
  );
}
