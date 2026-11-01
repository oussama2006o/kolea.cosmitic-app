import gsap from 'gsap';

export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const animateFadeIn = (element: HTMLElement | null, delay: number = 0) => {
  if (!element || isReducedMotion()) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay,
      ease: 'power2.out',
    }
  );
};

export const animateStaggerCards = (
  container: HTMLElement | null,
  cardSelector: string = '.product-card-item'
) => {
  if (!container || isReducedMotion()) return;
  const cards = container.querySelectorAll(cardSelector);
  if (!cards.length) return;

  gsap.fromTo(
    cards,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power2.out',
    }
  );
};

export const animateQuickAdd = (targetBtn: HTMLElement | null) => {
  if (!targetBtn || isReducedMotion()) return;
  gsap.timeline()
    .to(targetBtn, { scale: 0.94, duration: 0.1, ease: 'power1.in' })
    .to(targetBtn, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
};

export const animateSliderTransition = (
  track: HTMLElement | null,
  slideIndex: number,
  totalSlides: number
) => {
  if (!track || totalSlides <= 0) return;
  const shiftPercent = -((slideIndex * 100) / totalSlides);
  if (isReducedMotion()) {
    track.style.transform = `translateX(${shiftPercent}%)`;
    return;
  }
  gsap.to(track, {
    xPercent: shiftPercent,
    duration: 0.55,
    ease: 'power2.out',
  });
};
