"use client";
import { Mail, Phone } from "lucide-react";
import ContactForm from "./ContactForm";
import Container from "../container/Container";
import Link from "next/link";

export default function ContactUs() {
  return (
    <Container >
      <div className="w-full bg-[#F2F4F6] rounded-3xl p-6 lg:p-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Contact Info */}
          <div className="max-w-md">
            <h1 className="lg:text-[40px] md:text-3xl text-2xl font-bold text-primary-black">
              Still have questions?
            </h1>
            <h2 className="lg:text-[40px] md:text-3xl text-2xl font-bold text-[#7D8381] md:mb-6 mb-4">
              Contact our team
            </h2>

            <p className="text-primary-gray md:mb-12 mb-8 text-lg leading-relaxed">
              Our dedicated support specialists are available to help you
              navigate the property market with confidence.
            </p>

            {/* Contact Support Section */}
            <div>
              <h3 className="md:text-2xl text-xl font-bold md:mb-4 mb-3 text-primary-black">
                Contact support
              </h3>
              <p className="text-primary-gray md:mb-4 mb-3">
                We usually respond within 1 business day.
              </p>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center size-11 rounded-lg bg-[#0036AC1A]">
                      <Mail className="size-5 text-[#1F4E8B]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary-gray uppercase">
                      Email us
                    </p>
                    <Link
                      href="mailto:support@betteroffmarket.com"
                      className=" font-semibold text-primary-black"
                    >
                      support@betteroffmarket.com
                    </Link>
                  </div>
                </div>

                {/* Phone */}
                {/* <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center size-11 rounded-lg bg-[#0036AC1A]">
                      <Phone className="size-5 text-[#1F4E8B]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary-gray uppercase">
                      Call us
                    </p>
                    <Link
                      href="tel:+1 (800) 456789"
                      className="font-semibold text-primary-black"
                    >
                      +1 (800) 456789
                    </Link>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <div className="bg-white/20 rounded-2xl xl:p-10 lg:p-8 p-5 shadow-[0_10px_30px_0_rgba(15,23,42,0.05)]">
              <h3 className="lg:text-2xl text-xl font-semibold md:mb-6 mb-5 text-primary-black">
                Send us a message
              </h3>

              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
