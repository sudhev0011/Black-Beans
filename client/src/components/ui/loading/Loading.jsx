"use client"

import { useEffect, useState } from "react"

const Loading = () => {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length >= 3) {
          return ""
        }
        return prevDots + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div
            className="absolute inset-0 rounded-full border-4 border-t-customGreen animate-spin"
            style={{ animationDuration: "1.5s" }}
          ></div>
        </div>

        {/* Loading text */}
        <div className="flex items-center font-marcellus text-lg text-customGreen">
          <span>Loading{dots}</span>
        </div>
      </div>
    </div>
  )
}

export default Loading

