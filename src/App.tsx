/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// Use a constant for the custom element to avoid JSX type issues
const SplineViewer = 'spline-viewer' as any;

interface WorkItemProps {
  year: string;
  title: string;
  subtitle?: string;
}

const WorkItem = ({ year, title, subtitle }: WorkItemProps) => (
  <div className="mb-2 text-sm">
    <span className="font-bold mr-2">{year}</span>
    <span className="opacity-80">— {title}</span>
    {subtitle && <span className="opacity-60 italic ml-1">({subtitle})</span>}
  </div>
);

// Main Application Component - V2
export default function App() {
  const [activeOverlay, setActiveOverlay] = useState<'bio' | 'music' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const splineRef = useRef<any>(null);

  // Helper to get Spline runtime
  const getSplineRuntime = useCallback(() => {
    const spline = splineRef.current;
    if (!spline) return null;
    return spline.spline || spline._spline || spline.runtime || spline;
  }, []);

  const setSplineVariable = useCallback((name: string, value: number) => {
    try {
      const runtime = getSplineRuntime();
      if (runtime && typeof runtime.setVariable === 'function') {
        // If setting to 1, we pulse it (0 then 1) to ensure triggers fire
        if (value === 1) {
          runtime.setVariable(name, 0);
          setTimeout(() => {
            runtime.setVariable(name, 1);
          }, 10);
        } else {
          runtime.setVariable(name, 0);
        }
      }
    } catch (e) {
      console.warn(`Spline variable ${name} could not be set yet.`, e);
    }
  }, [getSplineRuntime]);

  const changeView = useCallback((view: 'bio' | 'music' | null) => {
    setActiveOverlay(view);
    
    // Sync Spline variables
    if (view === 'bio') {
      setSplineVariable('sceneVarBio', 1);
      setSplineVariable('sceneVarMusic', 0);
      setSplineVariable('sceneVarPoem', 0);
    } else if (view === 'music') {
      setSplineVariable('sceneVarMusic', 1);
      setSplineVariable('sceneVarBio', 0);
      setSplineVariable('sceneVarPoem', 0);
    } else {
      setSplineVariable('sceneVarPoem', 1);
      setSplineVariable('sceneVarBio', 0);
      setSplineVariable('sceneVarMusic', 0);
    }
  }, [setSplineVariable]);

  const goHome = () => changeView(null);
  const toggleBio = () => changeView(activeOverlay === 'bio' ? null : 'bio');
  const toggleMusic = () => changeView(activeOverlay === 'music' ? null : 'music');

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setSplineVariable('sceneVarMute', newMuted ? 1 : 0);
  };

  // Close overlays on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') changeView(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeView]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white font-serif selection:bg-gold/30">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {/* Spline Background */}
        <div className="absolute inset-0 z-0">
          <SplineViewer
            ref={splineRef}
            url="https://prod.spline.design/Vi-TzRE4G-lOpxXh/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Navigation UI */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Top Left: Home */}
        <button
          onClick={goHome}
          className="absolute top-8 left-8 pointer-events-auto group flex items-center gap-2"
        >
          <div className="animate-boil group-hover:opacity-60 transition-all duration-300">
            <span className="font-display font-bold italic text-sm tracking-[0.2em] uppercase group-hover:tracking-[0.3em] transition-all duration-300 gold-text">Home</span>
          </div>
        </button>

        {/* Top Right: Bio */}
        <button
          onClick={toggleBio}
          className="absolute top-8 right-8 pointer-events-auto group flex items-center gap-2"
        >
          <div className="animate-boil group-hover:opacity-60 transition-all duration-300 text-right">
            <span className="font-display font-bold italic text-sm tracking-[0.2em] uppercase group-hover:tracking-[0.3em] transition-all duration-300 gold-text">Bio</span>
          </div>
        </button>

        {/* Bottom Left: Music */}
        <button
          onClick={toggleMusic}
          className="absolute bottom-8 left-8 pointer-events-auto group flex items-center gap-2"
        >
          <div className="animate-boil group-hover:opacity-60 transition-all duration-300">
            <span className="font-display font-bold italic text-sm tracking-[0.2em] uppercase group-hover:tracking-[0.3em] transition-all duration-300 gold-text">Music</span>
          </div>
        </button>

        {/* Bottom Right: Mute/Unmute */}
        <button
          onClick={toggleMute}
          className="absolute bottom-8 right-8 pointer-events-auto group flex items-center gap-2"
        >
          <div className="animate-boil group-hover:opacity-60 transition-all duration-300 text-right">
            <span className="font-display font-bold italic text-sm tracking-[0.2em] uppercase group-hover:tracking-[0.3em] transition-all duration-300 gold-text">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </div>
        </button>
      </div>

      {/* Overlays */}
      <AnimatePresence mode="wait">
        {activeOverlay === 'bio' && (
          <motion.div
            key="bio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: '-50%' }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="fixed top-1/2 left-8 z-50 w-[450px] max-w-[90vw] max-h-[70vh] mobile-bio-fullscreen overflow-hidden glass-panel"
            style={{
              clipPath: 'polygon(1% 1%, 99% 0%, 98% 30%, 100% 70%, 99% 99%, 30% 98%, 0% 100%, 1% 40%)',
            }}
          >
            <div className="relative z-10 h-full overflow-y-auto scrollbar-hide p-8 md:p-12">
              <button 
                onClick={() => changeView(null)}
                className="absolute top-4 right-4 p-2 hover:opacity-60 transition-opacity"
              >
                <X size={20} />
              </button>
              <header className="mb-8">
                <h1 className="font-display text-2xl md:text-3xl uppercase leading-tight gold-text">
                  Seb Gainsborough <br />
                  <span className="font-bold italic">/ Vessel</span>
                </h1>
              </header>

              <div className="space-y-6 text-sm md:text-base leading-relaxed opacity-90">
                <p className="font-bold text-gold-light">
                  Seb Gainsborough makes electronic and contemporary instrumental music under both his own name and the pseudonym Vessel.
                </p>
                <p>
                  Producer and composer Sebastian Gainsborough sits between, amongst and around the world of experimental pop and composition with outlets ranging from the production of singles for the likes of <strong className="font-bold italic text-gold-light">Fever Ray</strong> or remixing <strong className="font-bold italic text-gold-light">HEALTH, Foals and Lyra Pramuk</strong> to composing new instrumental work for <strong className="text-gold-light">Tate Modern, Manchester Collective and Somerset House</strong>.
                </p>
                <p>
                  His early work was more industrial in nature, eschewing instruments in favour of heavily manipulated everyday sound to create crushing, heavy soundscapes. As time marched on, more and more light crept in, with those foley sounds becoming cleaner, and straight out of nature.
                </p>
                <p className="italic border-l-2 border-gold/40 pl-4 py-1 font-bold text-gold-light">
                  If 2018’s Queen of Golden Dogs was the light peaking from the clouds, So! is staring at the sun & moon, revelling in questions without answers.
                </p>
                <p className="italic opacity-75">
                  Whilst diverse in output, Gainsborough is truly a singular artist.
                </p>
              </div>

              <div className="mt-12 space-y-10">
                <section>
                  <h3 className="font-display font-bold italic text-[10px] uppercase tracking-[0.3em] text-gold/60 mb-6">Performance</h3>
                  <WorkItem year="2022" title="Logos" subtitle="Southbank Centre / NYX" />
                  <WorkItem year="2021" title="Squint" subtitle="Southbank Centre / Manchester Collective" />
                  <WorkItem year="2020" title="Passion" subtitle="Somerset House" />
                  <WorkItem year="2019" title="Written In Fire" subtitle="Snape Maltings" />
                  <WorkItem year="2019" title="Paradise Lost" subtitle="Manchester Collective" />
                  <WorkItem year="2016" title="Transition" subtitle="Tate Britain" />
                </section>

                <section>
                  <h3 className="font-display font-bold italic text-[10px] uppercase tracking-[0.3em] text-gold/60 mb-6">Media Composition</h3>
                  <WorkItem year="2024" title="Monkey Man" subtitle="Dev Patel" />
                  <WorkItem year="2024" title="Masterpiece Mommy" subtitle="Dorothy Sing Zhang" />
                  <WorkItem year="2023" title="Birdsong" subtitle="Anouk De Clerq" />
                  <WorkItem year="2022" title="The Northman" subtitle="Robert Eggers" />
                  <WorkItem year="2021" title="OK / We’ll Find You..." subtitle="Anouk De Clerq" />
                  <WorkItem year="2020" title="One" subtitle="Anouk De Clerq" />
                  <WorkItem year="2019" title="Helga Humming" subtitle="Anouk De Clerq" />
                  <WorkItem year="2016" title="The Handmaiden" subtitle="Trailer" />
                  <WorkItem year="2015" title="Gravity Fatigue" subtitle="Saddlers Wells" />
                  <WorkItem year="2015" title="Alexander McQueen" subtitle="A/W Runway" />
                </section>

                <section>
                  <h3 className="font-display font-bold italic text-[10px] uppercase tracking-[0.3em] text-gold/60 mb-6">Recorded Works</h3>
                  <WorkItem year="2018" title="Queen of Golden Dogs" subtitle="LP" />
                  <WorkItem year="2014" title="Punish, Honey" subtitle="LP" />
                  <WorkItem year="2012" title="Order of Noise" subtitle="LP" />
                </section>
              </div>

              <footer className="mt-16 flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.2em]">
                <a
                  href="https://open.spotify.com/playlist/3ziHOz6ju5FfPHdZNb03ip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-gold/30 pb-1 hover:border-gold transition-colors text-gold-light"
                >
                  Highlights
                </a>
                <a
                  href="https://sebgainsborough.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-gold/30 pb-1 hover:border-gold transition-colors text-gold-light"
                >
                  Official Site
                </a>
              </footer>
            </div>
          </motion.div>
        )}

        {activeOverlay === 'music' && (
          <motion.div
            key="music"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          >
            <div className="relative w-full max-w-4xl aspect-video glass-panel overflow-hidden rounded-2xl">
              <button 
                onClick={() => changeView(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
              >
                <X size={20} />
              </button>
              <iframe
                src="https://samply.app/embed/dwkFy8HW1FDEWfNu0hGK?si=GjMmCoBB3GV9j8LFTP2PYp2Qt833&color=1F1C1B"
                className="w-full h-full border-none"
                title="Audio Showcase"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Overlay Close Area */}
      {activeOverlay && (
        <div
          className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-sm"
          onClick={() => changeView(null)}
        />
      )}
    </div>
  );
}
