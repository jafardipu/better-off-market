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
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2  gap-8 md:gap-12 lg:gap-16 items-center">
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
              At BetterOffMarket, our mission is to make real estate opportunities easier to discover, share, and pursue. We believe the best opportunities aren't always found through traditional channels, and the right connections can make all the difference.
            </p>
            <p>
              By bringing buyers, sellers, wholesalers, and investors together in one centralized marketplace, BetterOffMarket streamlines how people connect, communicate, and negotiate—from discovering properties to exchanging offers.
            </p>
            <p>
              We're starting with <span className="font-medium"> 18 counties across Southwest Ohio and Northern Kentucky </span>, with a vision to make off-market real estate more accessible to everyone.
            </p>
          </motion.div>
          <div className='text-lg font-medium text-black mt-2 text-primary-gray space-y-2'>

            <p>If your county is on the map, you're in.</p>
            <p className="text-black">Better Connections. Better Opportunities. BetterOffMarket.</p>
          </div>

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