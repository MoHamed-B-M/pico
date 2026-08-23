import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * Staggered entry (fade-in + slide-up) for every `.result-card` in the
 * list whenever a new batch of results arrives, then a springy scale
 * "pop" on each savings badge.
 */
export function useResultStagger(listRef, results) {
  useGSAP(
    () => {
      const cards = listRef.current?.querySelectorAll('.result-card');
      if (!cards?.length) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(cards, { y: 24, opacity: 0, duration: 0.45, stagger: 0.08 }).from(
        listRef.current.querySelectorAll('.savings-badge'),
        { scale: 0.5, opacity: 0, duration: 0.5, ease: 'elastic.out(1, 0.55)', stagger: 0.08 },
        '-=0.15'
      );
    },
    { scope: listRef, dependencies: [results.length], revertOnUpdate: false }
  );
}
