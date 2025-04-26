"use client"

import { useEffect, useRef } from "react"

const LiquidLoading = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let particles = []

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create particles
    const createParticles = () => {
      particles = []
      const particleCount = 20

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 20 + 5,
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 2 - 1,
          color: "#114639",
          opacity: Math.random() * 0.5 + 0.1,
        })
      }
    }

    createParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(17, 70, 57, ${particle.opacity})`
        ctx.fill()

        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1
      })

      // Draw loading text
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.font = "bold 24px 'Tenor Sans', sans-serif"
      ctx.textAlign = "center"
      ctx.fillStyle = "#114639"
      ctx.fillText("LOADING", centerX, centerY)

      // Draw loading circle
      const time = Date.now() / 1000
      ctx.beginPath()
      ctx.arc(centerX, centerY - 60, 40, 0, Math.PI * 2)
      ctx.strokeStyle = "#114639"
      ctx.lineWidth = 2
      ctx.stroke()

      // Animated arc
      ctx.beginPath()
      ctx.arc(centerX, centerY - 60, 40, time % (Math.PI * 2), (time % (Math.PI * 2)) + Math.PI)
      ctx.strokeStyle = "#114639"
      ctx.lineWidth = 4
      ctx.stroke()

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0a1a18]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

export default LiquidLoading

