"use client";

import Link from "next/link";
import { legalLinks, quickLinks } from "./footer.data";
import logoImage from "@/assets/images/logo_blue.png";
import Image from "next/image";
import { GlobeIcon, UsersIcon } from "@/icons";
import Container from "../container/Container";

export default function Footer() {
  return (
    <footer className="bg-[#E0E3E5] xl:mt-24 lg:mt-20 mt-16">
      <div className="xl:pt-16 md:pt-12 pt-8 xl:pb-7 pb-6 border-b border-primary-border-color">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Logo Column */}
            <div className=" flex flex-col">
              <div className="mb-4 space-y-0.5">
                <Image
                  src={logoImage}
                  alt="logo"
                  className="max-w-29.75 object-cover"
                />
                <p className="text-primary-gray mt-4 transition-colors sm:text-base text-sm">
                  The leading direct-to-buyer investment property marketplace.
                </p>
              </div>
            </div>

            {/* Quick Access Column */}
            <div className="lg:mx-auto">
              <h3 className="sm:mb-4 mb-3 xl:text-sm font-semibold uppercase tracking-wide text-primary-color ">
                QUICK LINKS
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {quickLinks?.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className=" transition-colors text-sm text-primary-gray font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* legal Column */}
            <div className="lg:mx-auto">
              <h3 className="sm:mb-4 mb-3 xl:text-sm font-semibold uppercase tracking-wide text-primary-color ">
                LEGAL
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {legalLinks?.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className=" transition-colors text-sm text-primary-gray font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="lg:mx-auto">
              <h3 className="sm:mb-4 mb-3 xl:text-sm font-semibold uppercase tracking-wide text-primary-color ">
                CONTACT
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li>
                  <Link
                    href={"/contact-us"}
                    className=" transition-colors text-sm text-primary-gray font-medium"
                  >
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link
                    href={"https://www.betteroffmarket.com"}
                    className=" transition-colors text-sm text-primary-color font-bold"
                  >
                    BetterOffMarket.com
                  </Link>
                </li>
              </ul>
              {/* ===================== Social Links =========================== */}
              {/* <div className="flex items-center gap-x-2 mt-3">
                <Link
                  href={"https://www.google.com"}
                  className=" size-7 flex-center rounded-full"
                >
                  <GlobeIcon className="hover:scale-105" />
                </Link>
                <Link
                  href={"https://www.google.com"}
                  className=" size-7 flex-center rounded-full"
                >
                  <UsersIcon className="hover:scale-105" />
                </Link>
              </div> */}
            </div>
          </div>
        </Container>
      </div>
      <Container className="py-8 text-center text-primary-gray text-sm font-medium">
          © {new Date().getFullYear()} BetterOffMarket. All rights reserved.
      </Container>
    </footer>
  );
}
