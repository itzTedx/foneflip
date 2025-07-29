"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";

import type { IconProps } from "./icon";
import { getVariants, IconWrapper, useAnimateIconContext } from "./icon";

type PanelLeftProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line: {
      initial: { x1: 9, y1: 3, x2: 9, y2: 21 },
      animate: {
        x1: 7,
        y1: 3,
        x2: 7,
        y2: 21,
        transition: { type: "spring", damping: 20, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

/**
 * Renders an animated SVG icon representing a left panel using motion variants and context-based animation controls.
 *
 * @param size - The width and height of the icon in pixels
 */
function IconComponent({ size, ...props }: PanelLeftProps) {
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
        height={18}
        initial="initial"
        rx={2}
        ry={2}
        variants={variants.rect}
        width={18}
        x={3}
        y={3}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line}
        x1={9}
        x2={9}
        y1={3}
        y2={21}
      />
    </motion.svg>
  );
}

function PanelLeft(props: PanelLeftProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PanelLeft,
  PanelLeft as PanelLeftIcon,
  type PanelLeftProps as PanelLeftIconProps,
  type PanelLeftProps,
};
