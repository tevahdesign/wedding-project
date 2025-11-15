'use client'

import { useEffect, useMemo, useState } from 'react'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
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
import { Copy, Link as LinkIcon, Loader2, Check, RefreshCw, Share2, Eye } from 'lucide-react'
import Link from 'next/link'
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
  const [isCopiedId, setIsCopiedId] = useState(false)
  const [isCopiedCode, setIsCopiedCode] = useState(false)
  const [loading, setLoading] = useState(true);
  const [initialVanityUrl, setInitialVanityUrl] = useState<string | null>(null);
  
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
        if (!userWebsiteRef) {
          if (!user) setLoading(false);
          return;
        }

        try {
            const docSnap = await getDoc(userWebsiteRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setVanityUrl(data.vanityUrl || `wedding-${user!.uid.slice(0,6)}`);
                setShareCode(data.shareCode || generateShareCode());
                setInitialVanityUrl(data.vanityUrl || null);
            } else {
                resetFormToDefaults();
            }
        } catch (e) {
            console.error("Failed to fetch website data: ", e);
            resetFormToDefaults();
        } finally {
            setLoading(false);
        }
    }
    fetchWebsiteData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userWebsiteRef]);


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
      const docSnap = await getDoc(userWebsiteRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};

      const finalShareCode = shareCode || generateShareCode();
      if (!shareCode) setShareCode(finalShareCode);

      // This object contains only the settings from THIS page.
      const sharingSettings = {
        vanityUrl,
        ownerId: user.uid,
        shareCode: finalShareCode,
      }

      // Merge with existing website content data before saving.
      const dataToSave = {
        ...existingData,
        ...sharingSettings
      };

      // Save to user's private collection
      await setDoc(userWebsiteRef, dataToSave, { merge: true });
      
      // Save to public dashboard collection
      const publicDashboardRef = doc(firestore, 'publicDashboards', vanityUrl);
      await setDoc(publicDashboardRef, { ownerId: user.uid, shareCode: finalShareCode }, { merge: true });

      // Save to public website collection
      const publicWebsiteRef = doc(firestore, 'websites', vanityUrl);
      await setDoc(publicWebsiteRef, dataToSave, { merge: true });
      
      // if vanityUrl changed, delete old public docs
      if (initialVanityUrl && initialVanityUrl !== vanityUrl) {
        const oldPublicDashboardRef = doc(firestore, 'publicDashboards', initialVanityUrl);
        await deleteDoc(oldPublicDashboardRef);
        const oldPublicWebsiteRef = doc(firestore, 'websites', initialVanityUrl);
        await deleteDoc(oldPublicWebsiteRef);
      }
      
      setInitialVanityUrl(vanityUrl);
      
      toast({
        title: 'Sharing Settings Saved!',
        description: 'Your Wedding ID and Access Code are ready to share.',
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

  const handleCopyToClipboard = (text: string, type: 'id' | 'code') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'id') setIsCopiedId(true);
      if (type === 'code') setIsCopiedCode(true);

      setTimeout(() => {
        setIsCopiedId(false);
        setIsCopiedCode(false);
      }, 2000); 

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
        description="Generate a private ID and code to share your planning progress."
        showBackButton
      >
        <Button asChild variant="outline">
            <Link href="/p/preview" target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Preview
            </Link>
        </Button>
      </PageHeader>
      <div className="p-4 pt-4 flex justify-center">
        <div className='w-full max-w-2xl space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Guest Access Settings</CardTitle>
              <CardDescription>
                Set a memorable Wedding ID and a private Access Code. Guests will use these at the Guest Login page to view your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                <Label htmlFor="vanity-url">Wedding ID</Label>
                 <div className="flex items-center space-x-2">
                    <Input
                        id="vanity-url"
                        placeholder="e.g., alex-and-jordan"
                        value={vanityUrl}
                        onChange={(e) => setVanityUrl(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        disabled={loading || isSaving}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(vanityUrl, 'id')} disabled={!vanityUrl}>
                        {isCopiedId ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                 <p className="text-xs text-muted-foreground">A unique, public identifier for your wedding.</p>
              </div>
               <div className="space-y-2">
                <Label htmlFor="share-code">Access Code</Label>
                 <div className="flex items-center space-x-2">
                    <Input id="share-code" value={shareCode} onChange={(e) => setShareCode(e.target.value.toUpperCase())} className="font-mono tracking-widest" disabled={loading || isSaving} />
                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(shareCode, 'code')} disabled={!shareCode}>
                        {isCopiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShareCode(generateShareCode())} disabled={loading || isSaving}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                 </div>
                 <p className="text-xs text-muted-foreground">A private password to share with guests.</p>
              </div>
            </CardContent>
          </Card>
           
           <div className='flex flex-col gap-2'>
            <Button
              className="w-full"
              size="lg"
              onClick={handleSave}
              disabled={isSaving || loading || !vanityUrl || !shareCode}
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
