"use client"

import { useEffect, useRef, useState } from "react"

export function useScrollAnimation(options = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (options.once !== false) {
            observer.unobserve(entry.target)
          }
        } else if (!options.once) {
          setIsVisible(false)
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin || "0px 0px -50px 0px",
      }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  // Re-run when the referenced DOM node becomes available
  }, [elementRef.current, options.threshold, options.rootMargin, options.once])

  return [elementRef, isVisible]
}

