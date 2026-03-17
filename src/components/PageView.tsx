"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Simplified PageView imitating a ViewPager or Swiper
export default function PageView({ children }: { children: React.ReactNode[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x)

    if (swipe < -swipeConfidenceThreshold && currentIndex < children.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (swipe > swipeConfidenceThreshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 relative w-full overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={currentIndex}
            className="absolute inset-0 w-full h-full overflow-y-auto hide-scroll px-5 pb-8 box-border"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: "grabbing" }}
          >
            {children[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {children.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-6 bg-cta" : "w-2 bg-slate-600 opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}
