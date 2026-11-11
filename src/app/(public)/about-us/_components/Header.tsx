"use client";

import Container from "@/components/shared/container/Container";
import about_image from "@/assets/images/about_image_1.png";
import Image from "next/image";
import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 24, },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.42, 0, 0.58, 1] },
  }),
};

export default function Header() {
  return (
    <Container className="flex flex-col lg:flex-row items-center justify-between gap-6">
      {/* content */}
      <div className="flex-1 md:space-y-4 space-y-3">
        <motion.h6
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp as any}
          className="text-sm text-primary-color font-semibold bg-[#D1E5FF] max-w-max px-4 py-1.5 rounded-full"
        >
          DIRECT REAL ESTATE
        </motion.h6>

        <motion.h3
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp as any}
          className="lg:text-[64px] md:text-4xl text-3xl font-bold"
        >
          About <span className="text-[#1F4E8B]"> BetterOffMarket </span>
        </motion.h3>

        <motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp as any}
          className="text-lg text-primary-gray max-w-lg leading-relaxed"
        >
          We believe better real estate opportunities start with better connections. BetterOffMarket
          provides a centralized platform where you can connect, communicate, and negotiate directly-
          making off-market real estate more accessible and efficient.
        </motion.p>
      </div>

      {/* image */}
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="rounded-xl overflow-hidden">
            <Image
              src={about_image.src}
              alt="about image"
              width={1024}
              height={1024}
              className="w-full object-cover rounded-xl"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "backOut" }}
            whileHover={{ rotate: 0, scale: 1.03 }}
            className="absolute -bottom-8 -left-6 lg:-left-12 bg-white rounded-lg shadow-xl p-4 max-w-65"
          >
            <div className="flex text-primary-color text-xl mb-1">★★★★★</div>
            <p className="text-xs font-semibold text-[#594139] leading-relaxed">
              "PropMarket completely changed how I look for off-market opportunities. The transparency is unmatched."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </Container>
  );
}