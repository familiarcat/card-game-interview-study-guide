'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface PrismLoaderProps {
  children: React.ReactNode
}

export function PrismLoader({ children }: PrismLoaderProps) {
  const [isPrismReady, setIsPrismReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initPrism = () => {
        if (window.Prism) {
          window.Prism.highlightAll()
          setIsPrismReady(true)
        } else {
          setTimeout(initPrism, 100)
        }
      }
      initPrism()
    }
  }, [])

  // Don't render children until Prism.js is ready
  if (!isPrismReady) {
    return (
      <>
        {/* Load Prism.js scripts */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-clike.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js" strategy="beforeInteractive" />
        
        {/* Loading state */}
        <div className="app-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading syntax highlighting...</p>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}
