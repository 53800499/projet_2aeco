/** @format */

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { Blog } from "@/types/blog";

const BlogCard = ({ blog }: { blog: Blog }) => {
  const { title, coverImage, excerpt, date, slug } = blog;

  return (
    <div className="group relative">
      {/* IMAGE */}
      <div className="mb-6 overflow-hidden rounded-sm">
        <Link
          href={`/alumni/${slug}`}
          aria-label="alumni profile"
          className="block">
          <Image
            src={coverImage!}
            alt="ancien élève CEG 2 Ouidah"
            className="w-full transition group-hover:scale-105"
            width={408}
            height={272}
            style={{ width: "100%", height: "auto" }}
            quality={100}
          />
        </Link>
      </div>

      {/* CONTENT */}
      <div>
        {/* NOM */}
        <h3>
          <Link
            href={`/alumni/${slug}`}
            className="mb-3 inline-block font-semibold text-black dark:text-white hover:text-primary text-[22px] leading-tight">
            {title}
          </Link>
        </h3>

        {/* EXCERPT / PARCOURS */}
        <p className="text-sm text-gray dark:text-white/60 mb-2">{excerpt}</p>

        {/* DATE / PROMOTION */}
        <span className="text-sm font-semibold leading-loose text-SereneGray">
          Promotion {format(new Date(date), "yyyy")}
        </span>
      </div>
    </div>
  );
};

export default BlogCard;
