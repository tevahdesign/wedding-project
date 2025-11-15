
'use client'

import { useEffect, useMemo, useState } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth, useFirestore } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { Copy, Link as LinkIcon, Loader2, Check, RefreshCw, Share2 } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/app/page-header'

function generateShareCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function SharePage() {
  const { user } = useAuth()
  const firestore = useFirestore()
  const { toast } = useToast()

  const [vanityUrl, setVanityUrl] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isCopiedUrl, setIsCopiedUrl] = useState(false)
  const [isCopiedCode, setIsCopiedCode] = useState(false)
  const [loading, setLoading] = useState(true);
  const [initialVanityUrl, setInitialVanityUrl] = useState<string | null>(null);
  
  const websiteOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareableDashboardUrl = `${websiteOrigin}/p/${vanityUrl}`;


  const userWebsiteRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/website`, 'details');
  }, [user, firestore]);


  const resetFormToDefaults = () => {
    setVanityUrl(user ? `wedding-${user.uid.slice(0,6)}` : 'our-wedding');
    setShareCode(generateShareCode());
    setInitialVanityUrl(null);
  }

  useEffect(() => {
    async function fetchWebsiteData() {
        if (userWebsiteRef) {
            setLoading(true);
            const docSnap = await getDoc(userWebsiteRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setVanityUrl(data.vanityUrl || '');
                setShareCode(data.shareCode || generateShareCode());
                setInitialVanityUrl(data.vanityUrl || null);
            } else {
                resetFormToDefaults();
            }
            setLoading(false);
        }
    }
    fetchWebsiteData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userWebsiteRef]);


  const handleSave = async () => {
    if (!userWebsiteRef || !firestore || !user || !vanityUrl) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot save. Please fill all fields and be logged in.',
      })
      return;
    }
    setIsSaving(true)
    try {
      // Fetch existing data to not overwrite it
      const docSnap = await getDoc(userWebsiteRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};

      const finalShareCode = shareCode || generateShareCode();
      if (!shareCode) setShareCode(finalShareCode);

      const dataToSave = {
        ...existingData,
        vanityUrl,
        ownerId: user.uid,
        shareCode: finalShareCode,
      };

      await setDoc(userWebsiteRef, dataToSave, { merge: true });
      
      const publicDashboardRef = doc(firestore, 'publicDashboards', vanityUrl);
      await setDoc(publicDashboardRef, { ownerId: user.uid, shareCode: finalShareCode }, { merge: true });
      
      setInitialVanityUrl(vanityUrl);
      
      toast({
        title: 'Sharing Settings Saved!',
        description: 'Your share link and code are ready.',
      })
    } catch (error) {
      console.error('Error saving sharing settings:', error)
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Your settings could not be saved. Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyToClipboard = (text: string, type: 'url' | 'code') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'url') setIsCopiedUrl(true);
      if (type === 'code') setIsCopiedCode(true);

      setTimeout(() => {
        setIsCopiedUrl(false);
        setIsCopiedCode(false);
      }, 2000); // Reset after 2 seconds

      toast({
        title: "Copied to Clipboard!",
        description: "The content is now in your clipboard.",
      });
    });
  };

  return (
    <div className="flex flex-col flex-1 pb-20">
      <PageHeader
        title="Share Your Dashboard"
        description="Generate a private link and code to share your planning progress."
        showBackButton
      />
      <div className="p-4 pt-4 flex justify-center">
        <div className='w-full max-w-2xl space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Sharing Settings</CardTitle>
              <CardDescription>
                Set a custom URL for your shared dashboard and manage the access code.
                This link is separate from your public wedding website URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                <Label htmlFor="vanity-url">Your Custom Share URL</Label>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-2.5 rounded-l-md border border-r-0 h-10 flex items-center truncate">
                    {websiteOrigin.replace('https://', '')}/p/
                  </span>
                  <Input
                    id="vanity-url"
                    placeholder="alex-and-jordan"
                    className="rounded-l-none"
                    value={vanityUrl}
                    onChange={(e) => setVanityUrl(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    disabled={loading}
                  />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="share-code">Dashboard Access Code</Label>
                 <div className="flex items-center space-x-2">
                    <Input id="share-code" value={shareCode} onChange={(e) => setShareCode(e.target.value.toUpperCase())} className="font-mono tracking-widest" />
                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(shareCode, 'code')}>
                        {isCopiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShareCode(generateShareCode())}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                 </div>
                 <p className="text-xs text-muted-foreground">Share this code with guests so they can view your dashboard.</p>
              </div>
            </CardContent>
          </Card>
           
           {vanityUrl && !loading && (
             <Card>
                <CardHeader>
                    <CardTitle>Your Links are Ready!</CardTitle>
                    <CardDescription>Share your dashboard with your guests, family, or wedding planner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <Label>Shareable Dashboard URL</Label>
                        <div className="flex items-center space-x-2 mt-2">
                             <Input value={shareableDashboardUrl} readOnly />
                             <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(shareableDashboardUrl, 'url')}>
                                {isCopiedUrl ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                             <Link href={shareableDashboardUrl} target="_blank">
                                <Button variant="ghost" size="icon"><LinkIcon className="h-4 w-4" /></Button>
                             </Link>
                        </div>
                    </div>
                </CardContent>
             </Card>
           )}

           <div className='flex flex-col gap-2'>
            <Button
              className="w-full"
              size="lg"
              onClick={handleSave}
              disabled={isSaving || loading}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Settings...
                </>
              ) : (
              <>
                  <Share2 className="mr-2 h-4 w-4" /> Save Sharing Settings
              </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
