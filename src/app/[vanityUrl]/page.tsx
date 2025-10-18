
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  query,
  orderByChild,
  equalTo,
  get,
  ref,
  DataSnapshot,
} from 'firebase/database'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { useDatabase } from '@/firebase'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Gem } from 'lucide-react'

type PublicWebsitePageProps = {
  params: { vanityUrl: string }
}

export default function PublicWebsitePage({ params }: PublicWebsitePageProps) {
  const { vanityUrl } = params
  const database = useDatabase()
  const [websiteData, setWebsiteData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWebsiteData = async () => {
      if (!database || !vanityUrl) return

      try {
        setLoading(true)
        const websitesRef = ref(database, 'users')
        const websiteQuery = query(
          websitesRef,
          orderByChild('website/details/vanityUrl'),
          equalTo(vanityUrl)
        )
        const websiteSnapshot = await get(websiteQuery)

        if (websiteSnapshot.exists()) {
          // Since there should only be one, get the first one
           websiteSnapshot.forEach((userSnapshot) => {
            setWebsiteData(userSnapshot.val().website.details);
          });
        } else {
          setError('This wedding website does not exist.')
        }
      } catch (err) {
        console.error('Error fetching website data:', err)
        setError('Could not load the wedding website. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchWebsiteData()
  }, [database, vanityUrl])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Gem className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Website...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-center bg-background text-destructive p-4">
        <div>
          <h1 className="text-2xl font-bold mb-4">
            Oops! Something went wrong.
          </h1>
          <p>{error}</p>
          <Button onClick={() => (window.location.href = '/')} className="mt-8">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  if (!websiteData) {
    // This case should be covered by the error state, but as a fallback:
    return (
      <div className="flex h-screen items-center justify-center text-center bg-background p-4">
        <div>
          <h1 className="text-2xl font-bold mb-4">Website Not Found</h1>
          <p>The wedding website you are looking for could not be found.</p>
          <Button onClick={() => (window.location.href = '/')} className="mt-8">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const { coupleNames, weddingDate, welcomeMessage, templateId } = websiteData
  const formattedDate = weddingDate
    ? format(new Date(weddingDate), 'MMMM do, yyyy')
    : 'Date to be announced'
  const template1 = PlaceHolderImages.find(
    (img) => img.id === 'website-template-1'
  )
  const template2 = PlaceHolderImages.find(
    (img) => img.id === 'website-template-2'
  )
  const previewImage = templateId === 'template-1' ? template1 : template2

  return (
    <div className="w-full min-h-screen bg-muted">
      {previewImage && (
        <div className="relative w-full h-screen text-white bg-slate-800">
          <Image
            src={previewImage.imageUrl}
            alt={previewImage.description}
            fill
            className="object-cover opacity-30"
            data-ai-hint={previewImage.imageHint}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <h1 className="font-headline text-5xl md:text-7xl font-bold">
              {coupleNames}
            </h1>
            <p className="mt-4 text-lg md:text-xl uppercase tracking-widest">
              Are getting married!
            </p>
            <div className="w-24 h-px bg-white my-8" />
            <p className="text-xl md:text-2xl font-semibold">{formattedDate}</p>
            <p className="mt-8 max-w-md text-base md:text-lg">
              {welcomeMessage}
            </p>
            <Button variant="outline" className="mt-12 text-black">
              RSVP
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
