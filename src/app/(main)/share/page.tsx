
'use client'

import { useEffect, useMemo, useState } from 'react'
import { ref, set, get, remove } from 'firebase/database'
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
import { useAuth, useDatabase } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { Copy, Link as LinkIcon, Loader2, Check, RefreshCw, Share2, Eye } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/app/page-header'

function generateShareCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function SharePage() {
  const { user } = useAuth()
  const database = useDatabase()
  const { toast } = useToast()

  const [vanityUrl, setVanityUrl] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isCopiedId, setIsCopiedId] = useState(false)
  const [isCopiedCode, setIsCopiedCode] = useState(false)
  const [loading, setLoading] = useState(true);
  const [initialVanityUrl, setInitialVanityUrl] = useState<string | null>(null);
  
  const userWebsiteRef = useMemo(() => {
    if (!user || !database) return null;
    return ref(database, `users/${user.uid}/website`);
  }, [user, database]);


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
            const snapshot = await get(userWebsiteRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                setVanityUrl(data.details?.vanityUrl || `wedding-${user!.uid.slice(0,6)}`);
                setShareCode(data.details?.shareCode || generateShareCode());
                setInitialVanityUrl(data.details?.vanityUrl || null);
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
    if (!userWebsiteRef || !database || !user || !vanityUrl) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot save. Please fill all fields and be logged in.',
      })
      return;
    }
    setIsSaving(true)
    try {
      const snapshot = await get(userWebsiteRef);
      const existingData = snapshot.exists() ? snapshot.val().details : {};

      const finalShareCode = shareCode || generateShareCode();
      if (!shareCode) setShareCode(finalShareCode);

      const sharingSettings = {
        vanityUrl,
        ownerId: user.uid,
        shareCode: finalShareCode,
      }

      const dataToSave = {
        ...existingData,
        ...sharingSettings
      };
      
      const detailsRef = ref(database, `users/${user.uid}/website/details`);
      await set(detailsRef, dataToSave);

      const publicDashboardRef = ref(database, `publicDashboards/${vanityUrl}`);
      await set(publicDashboardRef, { ownerId: user.uid, shareCode: finalShareCode });

      const publicWebsiteRef = ref(database, `websites/${vanityUrl}`);
      await set(publicWebsiteRef, dataToSave);
      
      if (initialVanityUrl && initialVanityUrl !== vanityUrl) {
        const oldPublicDashboardRef = ref(database, `publicDashboards/${initialVanityUrl}`);
        await remove(oldPublicDashboardRef);
        const oldPublicWebsiteRef = ref(database, `websites/${initialVanityUrl}`);
        await remove(oldPublicWebsiteRef);
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
