"use client";
import React, { useEffect, useState } from "react";
import { count as fallbackCount } from "@/app/api/data";
import SpinnerScreen from "@/components/Common/spinner/spinner-screen";
import type { PublicStats } from "@/lib/admin-users";
import Spinner from "@/components/Common/spinner/spinner";

const formatStatValue = (n: number, suffix = "") =>
  n > 0 ? `${n}${suffix}` : "0";

const buildCountItems = (stats: PublicStats) => [
  {
    icon: "👥",
    value: formatStatValue(stats.totalActive),
    description: "Anciens élèves inscrits",
  },
  {
    icon: "🎓",
    value: formatStatValue(stats.promoCount, "+"),
    description: "Promotions couvertes",
  },
  {
    icon: "🌍",
    value: formatStatValue(stats.countryCount, "+"),
    description: "Pays représentés",
  },
  {
    icon: "📸",
    value: `${stats.photoCompletionRate}%`,
    description: "Profils complétés avec photo",
  },
];

const Counter = ({ isColorMode }: { isColorMode: Boolean }) => {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(fallbackCount);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("stats unavailable");
        const stats = (await res.json()) as PublicStats;
        setCount(buildCountItems(stats));
      } catch (e) {
        console.error("public stats:", e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading)
    return (
      <div className="text-grey flex justify-center items-center my-30">
        <Spinner size="large" />
      </div>
    );

  return (
    <section
      className={` ${
        isColorMode
          ? "dark:bg-darklight bg-section"
          : "dark:bg-darkmode bg-white"
      }`}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center md:justify-between justify-center md:gap-0 gap-9">
          {count.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-[0.875rem]"
              data-aos="fade-up"
              data-aos-delay={`${index * 200}`}
              data-aos-duration="1000"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center dark:bg-primary/20 text-primary dark:text-primary text-4xl p-8">
                {item.icon}
              </div>
              <span className="text-5xl font-semibold text-midnight_text dark:text-white">
                {item.value}
              </span>
              <p className="text-base text-grey text-center max-w-[17.8125rem] w-full dark:text-white/50">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Counter;
