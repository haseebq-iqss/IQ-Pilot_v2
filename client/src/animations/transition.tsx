import { ReactNode } from "react";
import { motion } from "framer-motion";

export const FadeIn = ({
  children,
  duration = 0.35,
  delay = 0,
}: {
  children: ReactNode;
  duration?: number;
  delay?: number;
}) => {
  return (
    <motion.div
      style={{ width: "100%", height: "100%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

export const SlideInOut = ({
  children,
  duration = 0.2,
  delay = 0,
}: {
  children: ReactNode;
  duration?: number;
  delay?: number;
}) => {
  return (
    <motion.div
      style={{ width: "100%", height: "100%" }}
      initial={{ x: 10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -10, opacity: 0 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

export const IOSExpand = ({
  children,
  duration = 0.5,
  delay = 0,
}: {
  children: ReactNode;
  duration?: number;
  delay?: number;
}) => {
  const easing = [0.45, 0, 0.1, 1]; // cubic-bezier(0.45, 0, 0.1, 1)

  return (
    <motion.div
      style={{ width: "100%", height: "100%" }}
      initial={{ y: 10, opacity: 0, scale: 0.75 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -10, opacity: 0, scale: 0.75 }}
      transition={{ duration, delay, ease: easing }}
    >
      {children}
    </motion.div>
  );
};
