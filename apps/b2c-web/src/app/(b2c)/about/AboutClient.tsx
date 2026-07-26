'use client';
import { AboutHero } from './components/AboutHero';
import { AboutStats } from './components/AboutStats';
import { AboutStory } from './components/AboutStory';
import { AboutUSP } from './components/AboutUSP';
import { AboutSolutions } from './components/AboutSolutions';
import { AboutMission } from './components/AboutMission';

const About = () => {
  return (
    <div className="bg-[#fcfcfd] text-[#1a1a1a] selection:bg-primary/20 selection:text-primary-dark font-body">
      <AboutHero />
      <AboutStats />
      <AboutStory />
      <AboutUSP />
      <AboutSolutions />
      <AboutMission />
    </div>
  );
};

export default About;
