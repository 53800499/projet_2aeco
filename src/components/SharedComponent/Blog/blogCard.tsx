/** @format */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";

const BlogCard = ({ blog }: { blog: Blog }) => {
  const { title, coverImage, excerpt, date, slug } = blog;

  return (
    <div className="group relative mx-2 sm:mx-0 bg-white rounded-md shadow-md p-4 flex flex-col h-full dark:bg-darkmode">
      {/* IMAGE */}
      <div className="mb-6 overflow-hidden rounded-sm aspect-[4/4] relative">
        <Link
          href={`/blog/${slug}`}
          aria-label="article"
          className="block h-full w-full">
          <Image
            src={coverImage || "/images/blog/blog_1.png"}
            alt={title || "article"}
            fill
            className="object-cover transition group-hover:scale-105"
            quality={100}
          />
        </Link>
      </div>

      {/* CONTENT */}
      <div>
        {/* NOM */}
        <h3>
          <Link
            href={`/blog/${slug}`}
            className="mb-3 inline-block font-semibold text-black dark:text-white hover:text-primary text-[22px] leading-tight line-clamp-2">
            {title}
          </Link>
        </h3>

        {/* EXCERPT / PARCOURS */}
        <p className="text-sm text-gray dark:text-white/60 mb-2 line-clamp-3">
          {excerpt}
        </p>
        {/* DATE / PROMOTION */}
        {date && (
          <span className="text-sm font-semibold leading-loose text-SereneGray">
            {new Date(date).toLocaleDateString("fr-FR")}
          </span>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
