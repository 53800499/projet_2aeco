import React from 'react'
import BlogList from '@/components/Blog/BlogList'
import HeroSub from '@/components/SharedComponent/HeroSub'

const BlogPage = () => {
  const breadcrumbLinks = [
    { href: '/', text: 'Accueil' },
    { href: '/blog', text: 'Actualités' },
  ]
  return (
    <>
      <HeroSub
        title="Actualités & Vie de la communauté"
        description="Retrouvez les nouvelles de l’amicale, les événements, les témoignages d’anciens élèves, les parcours inspirants et les souvenirs qui continuent de faire vivre la communauté du CEG 2 Ouidah."
        breadcrumbLinks={breadcrumbLinks}
      />
      <BlogList />
    </>
  );
}

export default BlogPage
