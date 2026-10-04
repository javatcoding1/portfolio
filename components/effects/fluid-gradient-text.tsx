"use client"

import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

/**
 * Fluid Gradient Text — chanhdai shadcn registry component.
 * Source: chanhdai.com/components/fluid-gradient-text
 * Original file: `chanhdai.com/src/registry/components/fluid-gradient-text/fluid-gradient-text.tsx`
 * License: MIT (ncdai <dai@chanhdai.com>)
 *
 * Renders the given text as a single SVG `<text>` whose fill is a linear
 * gradient that starts transparent on the left and ramps to `currentColor`
 * on the right. The gradient's start-x is a Motion `useSpring` that
 * follows the pointer X (springified for the fluid "tail" feel). On
 * pointer-leave the start-x springs back to centre (0.5).
 *
 * Renders WITHIN its container — set the container's `text-*` to control
 * the gradient color and set its width/height to control the SVG size.
 * Includes a 1px `after:` baseline (`bg-current/15`) to anchor the text
 * visually against whatever sits below.
 */
export type FluidGradientTextProps = {
  /** Text content rendered inside the SVG. */
  text: string
  /**
   * SVG viewBox width used to scale the gradient and text layout.
   * @default 1200
   */
  svgViewBoxWidth?: number
  /**
   * SVG viewBox height used as the base text size.
   * @default 300
   */
  svgViewBoxHeight?: number
}

export function FluidGradientText({
  text,
  svgViewBoxWidth = 1200,
  svgViewBoxHeight = 300,
}: FluidGradientTextProps) {
  const gradientX1Raw = useMotionValue(0.5)
  const gradientX1 = useSpring(
    useTransform(gradientX1Raw, [0, 1], [0, svgViewBoxWidth]),
    {
      stiffness: 150,
      damping: 25,
    }
  )

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const containerRect = event.currentTarget.getBoundingClientRect()
    gradientX1Raw.set(
      (event.clientX - containerRect.left) / containerRect.width
    )
  }

  const handleMouseLeave = () => {
    gradientX1Raw.set(0.5)
  }

  return (
    <div
      className="relative size-full overflow-hidden after:absolute after:bottom-0 after:h-px after:w-full after:bg-current/15"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        className="size-full translate-y-[37.5%] select-none"
        viewBox={`0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="2"
          fill="url(#fluid_gradient_text_linear)"
          style={{
            fontFamily: "Helvetica",
            fontSize: svgViewBoxHeight,
            fontWeight: "bold",
          }}
        >
          {text}
        </text>
        <defs>
          <motion.linearGradient
            id="fluid_gradient_text_linear"
            x1={gradientX1}
            y1="0"
            x2={svgViewBoxWidth / 2}
            y2={svgViewBoxHeight}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.625" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </motion.linearGradient>
        </defs>
      </svg>
    </div>
  )
}
