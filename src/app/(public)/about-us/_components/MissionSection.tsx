"use client";

import Image from 'next/image'
import about_image from "@/assets/images/about_image_2.png";
import Container from '@/components/shared/container/Container';
import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function MissionSection() {
  return (
    <Container className="lg:py-16 py-8 bg-white">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2  gap-8 md:gap-12 lg:gap-16 items-start">
        {/* Left - Image */}
        <motion.div
          initial={{ opacity: 0, x: -40, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center md:justify-start "
        >
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={about_image}
              alt="Modern building representing our mission"
              className="object-cover w-full h-full"
            />
          </div>
        </motion.div>

        {/* Right - Content */}
        <div className="">
          {/* Heading */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            custom={0}
            variants={fadeUp as any}
          >
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-[32px] font-bold text-primary-black">Our mission</h2>
            </div>
          </motion.div>

          {/* Intro Paragraphs */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            custom={1}
            variants={fadeUp as any}
            className="space-y-4 text-lg text-primary-gray leading-relaxed"
          >
            <p>
              At BetterOffMarket, our mission is to create a smarter, more accessible way for real estate
              opportunities to be discovered, shared, and brought to life. We believe there is more to real estate
              than traditional channels, and that the right connections can open doors to opportunities that
              might otherwise go undiscovered.
            </p>
            <p>
              By bringing buyers, sellers, wholesalers, and investors together in one centralized marketplace,
              we're making it easier to build meaningful connections, explore new possibilities, and move
              transactions forward. From listing properties and connecting with interested parties to
              communicating and negotiating, BetterOffMarket brings the process together in one place-
              making real estate transactions more efficient, seamless, and accessible for everyone involved.
            </p>
            <p>
              Whether you're looking to sell a property, find your next, or expand your network,
              BetterOffMarket is designed to simplify the process and create a better experience from start to
              finish.
            </p>
          </motion.div>

          <p className='text-lg font-medium text-black mt-5'>Better Connections. Better Opportunities. BetterOffMarket.</p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            {/* Transparency */}
            {/* <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              custom={2}
              variants={fadeUp as any}
            >
              <h3 className="text-2xl font-bold text-primary-black mb-3">How it Works</h3>
              <p className="text-primary-gray leading-relaxed">
                A streamlined approach to off-market real estate-bringing discovery, communication, and
                negotiation together in one seamless platform.
              </p>
            </motion.div> */}

            {/* Efficiency */}
            {/* <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              custom={3}
              variants={fadeUp as any}
            >
              <h3 className="text-2xl font-bold text-primary-black mb-3">Efficiency</h3>
              <p className="text-primary-gray leading-relaxed">
                Closing timelines reduced by up to 40% through direct communication channels.
              </p>
            </motion.div> */}
          </div>
        </div>
      </div>
    </Container>
  )
}