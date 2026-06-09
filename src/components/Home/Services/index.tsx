/** @format */

"use client";
/** @format */

import React from "react";
import Link from "next/link";
import { Servicebox, associationObjectives } from "@/app/api/data";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useAuthProfile } from "@/app/context/AuthProfileContext";

const Services = () => {
  const { user } = useAuthProfile();
  return (
    <section className="bg-section dark:bg-darklight" id="objectifs">
      <div className="container mx-auto max-w-6xl px-4">
        {/* HEADER */}
        <div
          className="flex gap-2 items-center justify-center"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="1000">
          <span className="w-3 h-3 rounded-full bg-success"></span>
          <span className="font-medium text-midnight_text text-sm dark:text-white/50">
            Association des anciens élèves — CEG2 Ouidah
          </span>
        </div>

        <h2
          className="sm:text-4xl text-[28px] leading-tight font-bold text-midnight_text md:text-center text-start pt-7 pb-20 md:w-4/6 w-full m-auto dark:text-white"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="1000">
          {associationObjectives.intro}
        </h2>

        {/* CARDS */}
        <div className="grid md:grid-cols-12 sm:grid-cols-8 grid-cols-1 gap-7">
          {Servicebox.map((item, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={`${index * 200}`}
              data-aos-duration="1000"
              className="col-span-4 bg-white flex flex-col justify-between items-center text-center py-14 px-7 shadow-service rounded-md gap-8 dark:bg-darkmode">
              {/* ICON */}
              <Image
                src={item.icon}
                alt="feature icon"
                width={40}
                height={40}
                className="brightness-0 saturate-500"
              />

              {/* TITLE */}
              <h3 className="max-w-44 mx-auto text-2xl font-bold">
                {item.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="dark:text-white/50 text-base font-normal">
                {item.description}
              </p>
              {user ? null : (
                <>
                  <Link
                    href="#inscription"
                    className="hover:text-green-700 text-lg font-medium text-primary group flex items-center">
                    Rejoindre
                    <span>
                      <Icon icon="ei:chevron-right" width="30" height="30" />
                    </span>
                  </Link>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
