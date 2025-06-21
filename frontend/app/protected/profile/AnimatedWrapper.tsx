"use client";

import { ReactNode, useEffect, useState } from 'react'

interface AnimatedWrapperProps {
  children: ReactNode
  animation?: 'fadeInUp' | 'fadeIn' | 'slideIn'
  delay?: number
  duration?: number
}

export default function AnimatedWrapper({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.6
}: AnimatedWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [delay])

  const getAnimationClass = () => {
    switch (animation) {
      case 'fadeIn':
        return 'animate-fade-in'
      case 'slideIn':
        return 'animate-slide-in'
      default:
        return 'animate-fade-in-up'
    }
  }

  return (
    <div
      className={`transition-all ${isVisible ? getAnimationClass() : 'opacity-0'}`}
      style={{
        animationDuration: `${duration}s`,
        animationFillMode: 'both',
        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp ease-out;
        }

        .animate-fade-in {
          animation: fadeIn ease-out;
        }

        .animate-slide-in {
          animation: slideIn ease-out;
        }
      `}</style>
      {children}
    </div>
  )
}
