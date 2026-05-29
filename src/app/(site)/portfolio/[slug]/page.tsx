'use client'
import React from 'react'
import SlickSlider from '@/components/portfolio/Slider'
import Testimonial from '@/components/SharedComponent/Testimonial'
import PortfolioDetail from '@/components/portfolio/PortfolioDetail'
import Portfolio from '@/components/SharedComponent/portfollio'
import { portfolioinfo } from '@/app/api/data'
import { useParams } from 'next/navigation'

const Portfolios = () => {
  const { slug } = useParams()

  // Find the blog post by slug
  const item = portfolioinfo.find((item) => item.slug === slug)

  if (!item) {
    return <div>Loading...</div>
  }
  return (
    <>
      <section className='md:pt-44 pt-36 md:py-24 py-16 dark:bg-darkmode'>
        <div className='container mx-auto max-w-6xl'>
          <div className='branding_heading'>
            <h2
              className='text-4xl font-bold text-midnight_text pb-5 dark:text-white'
              data-aos='fade-right'
              data-aos-delay='200'
              data-aos-duration='1000'>
              {item.title}
            </h2>
            <div className='pb-[3.6875rem]'>
              <p
                className='text-secondary text-xl max-w-[38.6875rem] dark:text-white/50'
                data-aos='fade-Up'
                data-aos-delay='300'
                data-aos-duration='1000'>
                We are a dedicated team of passionate product managers, full
                stack developers, UX/UI designers, QA engineers and marketing.
              </p>
            </div>
          </div>
          <SlickSlider />
        </div>
      </section>
      <PortfolioDetail />
      <div className='border-b border-primary border-opacity-30'>
        <Testimonial />
      </div>
      <Portfolio />
    </>
  )
}

export default Portfolios
