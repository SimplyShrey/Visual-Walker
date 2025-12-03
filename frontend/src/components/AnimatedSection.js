// src/components/AnimatedSection.js
import React, { useState, useEffect, useRef } from 'react';

const useIntersectionObserver = (options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target); // Stop observing once visible
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current && observer) {
        observer.unobserve(ref.current);
      }
    }; 
  }, [ref, options]);

  return [ref, isIntersecting];
};

const AnimatedSection = ({ children }) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`animated-section ${isIntersecting ? 'is-visible' : ''}`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;