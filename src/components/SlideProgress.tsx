import { useState, useEffect, useRef } from 'react';

interface SlideProgressProps {
  totalSlides: number;
}

const SlideProgress = ({ totalSlides }: SlideProgressProps) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Scroll progress bar
    const handleScroll = () => {
      const main = document.querySelector('main');
      if (!main) return;
      const { scrollTop, scrollHeight, clientHeight } = main;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    const main = document.querySelector('main');
    main?.addEventListener('scroll', handleScroll, { passive: true });

    // Intersection observer for section tracking
    const sections = document.querySelectorAll('[data-slide]');
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slide = parseInt((entry.target as HTMLElement).dataset.slide || '1', 10);
            setCurrentSlide(slide);
          }
        }
      },
      { root: main, rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((s) => observerRef.current?.observe(s));

    return () => {
      main?.removeEventListener('scroll', handleScroll);
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <>
      {/* Progress bar at top */}
      <div className="sticky top-0 z-20 h-0.5 bg-war-amber/10 w-full">
        <div
          className="h-full bg-war-amber/60 transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Page counter */}
      <div className="fixed bottom-6 right-6 z-20 bg-war-surface border border-war-border rounded-sm px-3 py-1.5 shadow-lg">
        <span className="font-mono text-xxs text-war-text-muted">
          Page <span className="text-war-text">{currentSlide}</span> of {totalSlides}
        </span>
      </div>
    </>
  );
};

export default SlideProgress;
