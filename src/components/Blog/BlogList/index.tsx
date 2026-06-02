"use client"
import React, { useEffect, useState } from 'react'
import BlogCard from '@/components/SharedComponent/Blog/blogCard'
import { Blog } from '@/types/blog'

type ApiBlog = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  published_at: string | null
  created_at: string
}

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<Blog[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/blogs')
      const data = await res.json()
      if (!res.ok) return
      setPosts(
        ((data.blogs || []) as ApiBlog[]).map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          excerpt: b.excerpt,
          coverImage: b.cover_image,
          date: b.published_at || b.created_at,
        }))
      )
    }
    void load()
  }, [])

  return (
    <section
      className='flex flex-wrap justify-center pt-8 md:pb-24 pb-16 dark:bg-darkmode'
      id='blog'>
      <div className='container mx-auto  max-w-6xl'>
        <div className='grid grid-cols-12 gap-7'>
          {posts.map((blog, i) => (
            <div
              key={i}
              className='w-full lg:col-span-4 md:col-span-6 col-span-12'
              data-aos='fade-up'
              data-aos-delay='200'
              data-aos-duration='1000'>
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogList
