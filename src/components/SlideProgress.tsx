import { useState, useEffect, useRef } from 'react';

const SlideProgress = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Discover all sections with data-slide
    const sectionEls = document.querySelectorAll<HTMLElement>('[data-slide]');
    const total = sectionEls.length;
    setTotalSlides(total);

    // Populate the static <nav id="section-nav"> with links from section headings
    const nav = document.getElementById('section-nav');
    if (nav && nav.children.length === 0) {
      sectionEls.forEach((el) => {
        const num = parseInt(el.dataset.slide || '0', 10);
        const id = el.id || `s${num}`;
        const heading = el.querySelector('h1, h2, h3');
        const label = heading?.textContent?.trim() || `Section ${num}`;
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.className = 'font-mono text-xxs text-war-text-muted hover:text-war-amber transition-colors whitespace-nowrap';
        a.textContent = label;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', `#${id}`);
        });
        nav.appendChild(a);
      });
    }

    // Scroll progress — use window scroll
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = window.scrollY / docHeight;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Intersection observer — use viewport (root: null)
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slide = parseInt((entry.target as HTMLElement).dataset.slide || '1', 10);
            setCurrentSlide(slide);
          }
        }
      },
      { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sectionEls.forEach((s) => observerRef.current?.observe(s));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observerRef.current?.disconnect();
    };
  }, []);

  if (totalSlides === 0) return null;

  // Find which position (1-based index) the current slide is at
  const currentIndex = (() => {
    const els = document.querySelectorAll<HTMLElement>('[data-slide]');
    let idx = 1;
    els.forEach((el, i) => {
      if (parseInt(el.dataset.slide || '0', 10) === currentSlide) idx = i + 1;
    });
    return idx;
  })();

  return (
    <>
      {/* Progress bar at top of content area */}
      <div className="sticky top-0 z-20 h-0.5 bg-war-amber/10 w-full">
        <div
          className="h-full bg-war-amber/60 transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Page counter — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-20 bg-war-surface border border-war-border rounded-sm px-3 py-1.5 shadow-lg">
        <span className="font-mono text-xxs text-war-text-muted">
          Page <span className="text-war-text">{currentIndex}</span> of {totalSlides}
        </span>
      </div>
    </>
  );
};

export default SlideProgress;
