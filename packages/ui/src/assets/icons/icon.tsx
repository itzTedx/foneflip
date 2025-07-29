"use client";

import * as React from "react";

import type { LegacyAnimationControls, Variants } from "motion/react";
import { SVGMotionProps, useAnimation } from "motion/react";

import { cn } from "@ziron/utils";

const staticAnimations = {
  path: {
    initial: { pathLength: 1, opacity: 1 },
    animate: {
      pathLength: [0.05, 1],
      opacity: [0, 1],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        opacity: { duration: 0.01 },
      },
    },
  } as Variants,
  "path-loop": {
    initial: { pathLength: 1, opacity: 1 },
    animate: {
      pathLength: [1, 0.05, 1],
      opacity: [1, 0, 1],
      transition: {
        duration: 1.6,
        ease: "easeInOut",
        opacity: { duration: 0.01 },
      },
    },
  } as Variants,
} as const;

type StaticAnimations = keyof typeof staticAnimations;
type TriggerProp<T = string> = boolean | StaticAnimations | T;

interface AnimateIconContextValue {
  controls: LegacyAnimationControls | undefined;
  animation: StaticAnimations | string;
  loop: boolean;
  loopDelay: number;
}

interface DefaultIconProps<T = string> {
  animate?: TriggerProp<T>;
  onAnimateChange?: (
    value: boolean,
    animation: StaticAnimations | string
  ) => void;
  animateOnHover?: TriggerProp<T>;
  animateOnTap?: TriggerProp<T>;
  animation?: T | StaticAnimations;
  loop?: boolean;
  loopDelay?: number;
  onAnimateStart?: () => void;
  onAnimateEnd?: () => void;
}

interface AnimateIconProps<T = string> extends DefaultIconProps<T> {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  children: React.ReactElement<any, any>;
}

interface IconProps<T>
  extends DefaultIconProps<T>,
    Omit<
      SVGMotionProps<SVGSVGElement>,
      "animate" | "onAnimationStart" | "onAnimationEnd"
    > {
  size?: number;
}

interface IconWrapperProps<T> extends IconProps<T> {
  icon: React.ComponentType<IconProps<T>>;
}

const AnimateIconContext = React.createContext<AnimateIconContextValue | null>(
  null
);

/**
 * Retrieves the current animation context for icons, providing default values if no context is available.
 *
 * @returns The current animation context, or default animation settings if not within an `AnimateIconContext` provider.
 */
function useAnimateIconContext() {
  const context = React.useContext(AnimateIconContext);
  if (!context)
    return {
      controls: undefined,
      animation: "default",
      loop: false,
      loopDelay: 0,
    };
  return context;
}

/**
 * Provides animation controls and context for a single child element, enabling SVG icon animations based on props or user interactions.
 *
 * Supports triggering animations via props, hover, or tap events, with optional looping and animation lifecycle callbacks. Supplies animation context to descendants.
 *
 * @param children - The single React element to animate and provide context for
 */
function AnimateIcon({
  animate,
  onAnimateChange,
  animateOnHover,
  animateOnTap,
  animation = "default",
  loop = false,
  loopDelay = 0,
  onAnimateStart,
  onAnimateEnd,
  children,
}: AnimateIconProps) {
  const controls = useAnimation();
  const [localAnimate, setLocalAnimate] = React.useState(!!animate);
  const currentAnimation = React.useRef(animation);

  const startAnimation = React.useCallback(
    (trigger: TriggerProp) => {
      currentAnimation.current =
        typeof trigger === "string" ? trigger : animation;
      setLocalAnimate(true);
    },
    [animation]
  );

  const stopAnimation = React.useCallback(() => {
    setLocalAnimate(false);
  }, []);

  React.useEffect(() => {
    currentAnimation.current =
      typeof animate === "string" ? animate : animation;
    setLocalAnimate(!!animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  React.useEffect(
    () => onAnimateChange?.(localAnimate, currentAnimation.current),
    [localAnimate, onAnimateChange]
  );

  React.useEffect(() => {
    if (localAnimate) onAnimateStart?.();
    controls.start(localAnimate ? "animate" : "initial").then(() => {
      if (localAnimate) onAnimateEnd?.();
    });
  }, [localAnimate, controls, onAnimateStart, onAnimateEnd]);

  const handleMouseEnter = (e: MouseEvent) => {
    if (animateOnHover) startAnimation(animateOnHover);
    children.props?.onMouseEnter?.(e);
  };
  const handleMouseLeave = (e: MouseEvent) => {
    if (animateOnHover || animateOnTap) stopAnimation();
    children.props?.onMouseLeave?.(e);
  };
  const handlePointerDown = (e: PointerEvent) => {
    if (animateOnTap) startAnimation(animateOnTap);
    children.props?.onPointerDown?.(e);
  };
  const handlePointerUp = (e: PointerEvent) => {
    if (animateOnTap) stopAnimation();
    children.props?.onPointerUp?.(e);
  };

  const child = React.Children.only(children);
  const cloned = React.cloneElement(child, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  });

  return (
    <AnimateIconContext.Provider
      value={{
        controls,
        animation: currentAnimation.current,
        loop,
        loopDelay,
      }}
    >
      {cloned}
    </AnimateIconContext.Provider>
  );
}

const pathClassName =
  "[&_[stroke-dasharray='1px_1px']]:![stroke-dasharray:1px_0px]";

/**
 * Wraps an icon component to provide animation context and behavior based on animation-related props.
 *
 * If an animation context exists, merges or overrides animation settings and provides them to the icon. If animation props are specified but no context exists, wraps the icon in an `AnimateIcon` to manage animation triggers and lifecycle. Otherwise, renders the icon directly.
 *
 * @param icon - The icon component to render and animate
 * @param animation - The animation variant or type to apply
 * @param animate - Controls whether the animation is active
 * @param animateOnHover - Whether to trigger animation on hover
 * @param animateOnTap - Whether to trigger animation on tap
 * @param loop - Whether the animation should loop
 * @param loopDelay - Delay between animation loops in milliseconds
 * @param onAnimateChange - Callback invoked when animation state changes
 * @param onAnimateStart - Callback invoked when animation starts
 * @param onAnimateEnd - Callback invoked when animation ends
 * @param className - Additional CSS classes for the icon
 * @param size - The rendered icon size in pixels
 */
function IconWrapper<T extends string>({
  size = 28,
  animation: animationProp,
  animate,
  onAnimateChange,
  animateOnHover = false,
  animateOnTap = false,
  icon: IconComponent,
  loop = false,
  loopDelay = 0,
  onAnimateStart,
  onAnimateEnd,
  className,
  ...props
}: IconWrapperProps<T>) {
  const context = React.useContext(AnimateIconContext);

  if (context) {
    const {
      controls,
      animation: parentAnimation,
      loop: parentLoop,
      loopDelay: parentLoopDelay,
    } = context;
    const animationToUse = animationProp ?? parentAnimation;
    const loopToUse = loop || parentLoop;
    const loopDelayToUse = loopDelay || parentLoopDelay;

    return (
      <AnimateIconContext.Provider
        value={{
          controls,
          animation: animationToUse,
          loop: loopToUse,
          loopDelay: loopDelayToUse,
        }}
      >
        <IconComponent
          className={cn(
            className,
            (animationToUse === "path" || animationToUse === "path-loop") &&
              pathClassName
          )}
          size={size}
          {...props}
        />
      </AnimateIconContext.Provider>
    );
  }

  if (
    animate !== undefined ||
    onAnimateChange !== undefined ||
    animateOnHover ||
    animateOnTap ||
    animationProp
  ) {
    return (
      <AnimateIcon
        animate={animate}
        animateOnHover={animateOnHover}
        animateOnTap={animateOnTap}
        animation={animationProp}
        loop={loop}
        loopDelay={loopDelay}
        onAnimateChange={onAnimateChange}
        onAnimateEnd={onAnimateEnd}
        onAnimateStart={onAnimateStart}
      >
        <IconComponent
          className={cn(
            className,
            (animationProp === "path" || animationProp === "path-loop") &&
              pathClassName
          )}
          size={size}
          {...props}
        />
      </AnimateIcon>
    );
  }

  return (
    <IconComponent
      className={cn(
        className,
        (animationProp === "path" || animationProp === "path-loop") &&
          pathClassName
      )}
      size={size}
      {...props}
    />
  );
}

/**
 * Returns the animation variants for the current icon animation context, applying static or custom variants and looping behavior as needed.
 *
 * If the current animation type matches a static animation, returns the corresponding static variant for each key, skipping group keys for path animations. Otherwise, selects the variant matching the current animation type or falls back to the default. If looping is enabled, modifies the transition properties to repeat infinitely with the specified delay.
 *
 * @returns The set of animation variants to use for the current animation context.
 */
function getVariants<
  V extends { default: T; [key: string]: T },
  T extends Record<string, Variants>,
>(animations: V): T {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { animation: animationType, loop, loopDelay } = useAnimateIconContext();

  let result: T;

  if (animationType in staticAnimations) {
    const variant = staticAnimations[animationType as StaticAnimations];
    result = {} as T;
    for (const key in animations.default) {
      if (
        (animationType === "path" || animationType === "path-loop") &&
        key.includes("group")
      )
        continue;
      result[key] = variant as T[Extract<keyof T, string>];
    }
  } else {
    result = (animations[animationType as keyof V] as T) ?? animations.default;
  }

  if (loop) {
    for (const key in result) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const state = result[key] as any;
      const transition = state.animate?.transition;
      if (!transition) continue;

      const hasNestedKeys = Object.values(transition).some(
        (v) =>
          typeof v === "object" &&
          v !== null &&
          ("ease" in v || "duration" in v || "times" in v)
      );

      if (hasNestedKeys) {
        for (const prop in transition) {
          const subTrans = transition[prop];
          if (typeof subTrans === "object" && subTrans !== null) {
            transition[prop] = {
              ...subTrans,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              repeatDelay: loopDelay,
            };
          }
        }
      } else {
        state.animate.transition = {
          ...transition,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          repeatDelay: loopDelay,
        };
      }
    }
  }

  return result;
}

export {
  AnimateIcon,
  getVariants,
  IconWrapper,
  pathClassName,
  staticAnimations,
  useAnimateIconContext,
  type AnimateIconContextValue,
  type AnimateIconProps,
  type IconProps,
  type IconWrapperProps,
};
