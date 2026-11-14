"use client";

import { useMemo } from "react";
import Navbar from "../navbar/Navbar";
import Container from "../container/Container";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

type TProps = {
  data?: {
    title?: string;
    description?: string;
    className?: string;
    dataClassName?: string;
    authPage?: boolean;
    children?: React.ReactNode;
    titleClassName?: string;
    /** Pill under the right-side blurb (e.g. home region badge). */
    regionBadge?: string;
  };
};

const wordReveal = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.4 },
  },
};

const word = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HeroBanner({ data }: TProps) {
  const words = useMemo(() => (data?.title ?? "").split(" "), [data?.title]);

  return (
    <div className="relative overflow-hidden">
      {/* Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "absolute top-10 w-full z-30",
          data?.authPage && "hidden",
        )}
      >
        <Navbar variant="transparent" authPage={data?.authPage || false} />
      </motion.div>

      <div
        className={cn(
          "relative min-h-screen w-full flex flex-col justify-end pb-11 overflow-hidden",
          data?.className,
        )}
      >
        {/* Ken Burns style background */}
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ backgroundImage: `url('/banner_image.png')` }}
          className="absolute inset-0 bg-cover bg-center will-change-transform"
        />

        {/* Diagonal gradient wipe overlay */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeInOut" }}
          className="absolute inset-0 z-10 bg-[#1F4E8B]"
        />

        {/* Base darkening gradient */}
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_-59.22%,rgba(0,0,0,0.7)_69.98%)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30"
        >
          <Container className="mb-5 w-full">{data?.children}</Container>
        </motion.div>

        <Container
          className={cn(
            "relative grid md:grid-cols-3 2xl:gap-x-12 lg:gap-x-8 gap-x-4 z-20 text-white items-end",
            data?.dataClassName,
          )}
        >
          <div className="col-span-2">
            {/* Word-by-word masked reveal title */}
            <motion.h1
              variants={wordReveal}
              initial="hidden"
              animate="visible"
              className={cn("col-span-2 2xl:text-7xl lg:text-5xl md:text-4xl text-3xl font-semibold flex flex-wrap gap-x-3", data?.titleClassName)}
            >
              {words.map((w, i) => (
                <span key={i} className="overflow-hidden inline-block pb-2">
                  <motion.span variants={word} className="inline-block">
                    {w}
                  </motion.span>
                </span>
              ))}
            </motion.h1>
          </div>

          <div className="mt-4 lg:mt-0">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-medium text-lg"
            >
              {data?.description}
            </motion.p>
            {data?.regionBadge ? (
              <motion.h6
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 1.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-4 text-sm text-primary-color font-semibold bg-[#D1E5FF] max-w-max px-4 py-1.5 rounded-full"
              >
                {data.regionBadge}
              </motion.h6>
            ) : null}
          </div>
        </Container>
      </div>
    </div>
  );
}
