import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * Hero entrance timeline: header, dropzone and controls slide/fade in.
 * `start` gates playback (e.g. until the boot splash is dismissed).
 */
export function useIntro(scopeRef, start = true) {
  useGSAP(
    () => {
      if (!start) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.js-intro', { y: 28, opacity: 0, duration: 0.6, stagger: 0.12 }).from(
        '.js-intro-fade',
        { opacity: 0, duration: 0.8 },
        '-=0.2'
      );
    },
    { scope: scopeRef, dependencies: [start], revertOnUpdate: false }
  );
}
