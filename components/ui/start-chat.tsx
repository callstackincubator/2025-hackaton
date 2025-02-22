"use client"

import type React from "react"

import { motion } from "framer-motion"

interface JourneyButtonProps {
  text: string
  onClick: () => void
}

const JourneyButton: React.FC<JourneyButtonProps> = ({ text, onClick }) => {
  return (
    <motion.div
      className="inline-block cursor-pointer w-full max-w-md"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transform transition-all duration-300 ease-in-out hover:shadow-lg text-center my-4">
          <span className="text-base">Begin your daily journey</span>
        </div>
      </motion.div>
  )
}

export default JourneyButton

