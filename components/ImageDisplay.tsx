import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselPreviewProps {
  images: string[];
}

const CarouselPreview: React.FC<CarouselPreviewProps> = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-white/5">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentSlide}
            src={`data:image/png;base64,${images[currentSlide]}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
            alt={`Slide ${currentSlide + 1}`}
          />
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
          <button
            onClick={() => paginate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-md text-white rounded-full hover:bg-black/50 transition-all pointer-events-auto border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => paginate(1)}
            className="w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-md text-white rounded-full hover:bg-black/50 transition-all pointer-events-auto border border-white/10"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/10 z-20">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentSlide + 1) / images.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex gap-2 mt-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1);
              setCurrentSlide(index);
            }}
            className={`transition-all duration-300 rounded-full ${index === currentSlide
                ? 'w-8 h-2 bg-indigo-500'
                : 'w-2 h-2 bg-slate-700 hover:bg-slate-600'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselPreview;
