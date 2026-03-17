"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

export default function NumberTicker({
  value,
  duration = 2,
  prefix = "",
}: {
  value: number
  duration?: number
  prefix?: string
}) {
  const [hasStarted, setHasStarted] = useState(false)
  
  // Create a spring physics value that starts at 0
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  })

  // Transform the spring value to a formatted string
  const displayValue = useTransform(spring, (current) => {
    return Math.round(current).toLocaleString("pt-BR")
  })

  useEffect(() => {
    // Small delay to ensure it feels like it animates after mount
    const timer = setTimeout(() => {
      setHasStarted(true)
      spring.set(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value, spring])

  return (
    <div className="flex items-center font-mono">
      {prefix && <span className="text-cta mr-1 font-sans text-xl sm:text-2xl">{prefix}</span>}
      <motion.span>{displayValue}</motion.span>
    </div>
  )
}
