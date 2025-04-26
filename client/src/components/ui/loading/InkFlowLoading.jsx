"use client"

import { useEffect, useRef } from "react"

const InkFlowLoading = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let particles = []
    let time = 0

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create ink particles
    const createParticles = () => {
      particles = []
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const particleCount = 200

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 150 + 50

        particles.push({
          x: centerX + Math.cos(angle) * (Math.random() * 20),
          y: centerY + Math.sin(angle) * (Math.random() * 20),
          targetX: centerX + Math.cos(angle) * radius,
          targetY: centerY + Math.sin(angle) * radius,
          size: Math.random() * 6 + 2,
          color: "#114639",
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 0.02 + 0.01,
          progress: 0,
          wiggle: Math.random() * 20,
          wiggleSpeed: Math.random() * 0.05 + 0.01,
        })
      }
    }

    createParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.01

      // Draw and update particles
      particles.forEach((particle) => {
        // Update progress
        if (particle.progress < 1) {
          particle.progress += particle.speed
        }

        // Calculate position with easing
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
        const progress = easeOutCubic(particle.progress)

        // Add wiggle effect
        const wiggleX = Math.sin(time * particle.wiggleSpeed * 10) * particle.wiggle
        const wiggleY = Math.cos(time * particle.wiggleSpeed * 10) * particle.wiggle

        // Calculate current position
        const currentX = particle.x + (particle.targetX - particle.x) * progress + wiggleX * progress
        const currentY = particle.y + (particle.targetY - particle.y) * progress + wiggleY * progress

        // Draw particle
        ctx.beginPath()
        ctx.arc(currentX, currentY, particle.size * (1 - progress * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(17, 70, 57, ${particle.opacity * (1 - progress * 0.5)})`
        ctx.fill()
      })

      // Draw loading text
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.font = "bold 24px 'Tenor Sans', sans-serif"
      ctx.textAlign = "center"
      ctx.fillStyle = "#114639"
      ctx.fillText("LOADING", centerX, centerY + 80)

      // Draw pulsing circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, 40 + Math.sin(time * 2) * 5, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(17, 70, 57, 0.1)"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(centerX, centerY, 30 + Math.sin(time * 2 + 1) * 5, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(17, 70, 57, 0.2)"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(centerX, centerY, 20 + Math.sin(time * 2 + 2) * 5, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(17, 70, 57, 0.3)"
      ctx.fill()

      // Recreate particles that have completed their journey
      particles.forEach((particle, index) => {
        if (particle.progress >= 1) {
          // Reset particle
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * 150 + 50
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2

          particle.x = centerX + Math.cos(angle) * (Math.random() * 20)
          particle.y = centerY + Math.sin(angle) * (Math.random() * 20)
          particle.targetX = centerX + Math.cos(angle) * radius
          particle.targetY = centerY + Math.sin(angle) * radius
          particle.progress = 0
          particle.opacity = Math.random() * 0.5 + 0.1
          particle.size = Math.random() * 6 + 2
          particle.wiggle = Math.random() * 20
        }
      })

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

export default InkFlowLoading

