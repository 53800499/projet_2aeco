/** @format */
"use client";

import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import BlogCard from "./blogCard";
import type { Blog } from "@/types/blog";

type ApiBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
};

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<Blog[]>([]);
  
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/blogs?limit=3");
      const data = await res.json();
      if (!res.ok) return;
      setPosts(
        ((data.blogs || []) as ApiBlog[]).map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          excerpt: b.excerpt,
          coverImage: b.cover_image,
          date: b.published_at || b.created_at,
        }))
      );
    };
    void load();
  }, []);

  return (
    <section
      className="flex flex-wrap justify-center dark:bg-darkmode"
      id="news">
      <div className="container mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="flex items-baseline justify-between flex-wrap mx-auto max-w-6xl px-4 pt-16 pb-10">
          <h2
            className="sm:mb-11 mb-3 text-4xl font-bold text-midnight_text dark:text-white"
            data-aos="fade-right"
            data-aos-delay="200"
            data-aos-duration="1000">
            Actualités des anciens élèves
          </h2>

          <Link
            href="/blog"
            className="flex items-center gap-3 text-base text-midnight_text dark:text-white dark:hover:text-primary font-medium hover:text-primary sm:pb-0 pb-3"
            data-aos="fade-left"
            data-aos-delay="200"
            data-aos-duration="1000">
            Voir tout
            <span>
              <Icon icon="solar:arrow-right-outline" width="30" height="30" />
            </span>
          </Link>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-12 gap-7">
          {posts.map((item, i) => (
            <div
              key={i}
              className="w-full md:col-span-4 sm:col-span-6 col-span-12"
              data-aos="fade-up"
              data-aos-delay={`${i * 200}`}
              data-aos-duration="1000">
              <BlogCard blog={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
