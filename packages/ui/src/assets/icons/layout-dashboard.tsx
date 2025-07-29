"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";

import {
  getVariants,
  IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "./icon";

type LayoutDashboardProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect1: {
      initial: {
        height: 9,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        height: 5,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    rect2: {
      initial: {
        height: 5,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        height: 9,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    rect3: {
      initial: {
        height: 9,
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        height: 5,
        y: 4,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    rect4: {
      initial: {
        height: 5,
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        height: 9,
        y: -4,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    rect1: {
      initial: {
        height: 9,
      },
      animate: {
        height: [9, 5, 9],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    rect2: {
      initial: {
        height: 5,
      },
      animate: {
        height: [5, 9, 5],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    rect3: {
      initial: {
        height: 9,
        y: 0,
      },
      animate: {
        height: [9, 5, 9],
        y: [0, 4, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    rect4: {
      initial: {
        height: 5,
        y: 0,
      },
      animate: {
        height: [5, 9, 5],
        y: [0, -4, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

/**
 * Renders an animated dashboard icon as an SVG with four rectangles, each animated using motion variants from context.
 *
 * The icon's appearance and animation are determined by the current animation context and the provided size.
 *
 * @param size - The width and height of the SVG icon in pixels
 * @returns A React element representing the animated dashboard icon
 */
function IconComponent({ size, ...props }: LayoutDashboardProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.rect
        animate={controls}
        height={9}
        initial="initial"
        rx={1}
        ry={1}
        variants={variants.rect1}
        width={7}
        x={3}
        y={3}
      />
      <motion.rect
        animate={controls}
        height={5}
        initial="initial"
        rx={1}
        ry={1}
        variants={variants.rect2}
        width={7}
        x={14}
        y={3}
      />
      <motion.rect
        animate={controls}
        height={9}
        initial="initial"
        rx={1}
        ry={1}
        variants={variants.rect3}
        width={7}
        x={14}
        y={12}
      />
      <motion.rect
        animate={controls}
        height={5}
        initial="initial"
        rx={1}
        ry={1}
        variants={variants.rect4}
        width={7}
        x={3}
        y={16}
      />
    </motion.svg>
  );
}

function LayoutDashboard(props: LayoutDashboardProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LayoutDashboard,
  LayoutDashboard as LayoutDashboardIcon,
  type LayoutDashboardProps as LayoutDashboardIconProps,
  type LayoutDashboardProps,
};
