
'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { format } from 'date-fns'

import { PageHeader } from '@/components/app/page-header'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useAuth, useFirestore } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { Copy, Link as LinkIcon, Loader2, Check, Trash2, Globe, Share2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'

function generateShareCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function WebsiteBuilderPage() {
  const { user } = useAuth()
  const firestore = useFirestore()
  const { toast } = useToast()

  const [coupleNames, setCoupleNames] = useState('')
  const [weddingDate, setWeddingDate] = useState<Date | undefined>(undefined)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [vanityUrl, setVanityUrl] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('template-1')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [loading, setLoading] = useState(true);
  const [initialVanityUrl, setInitialVanityUrl] = useState<string | null>(null);
  
  const websiteOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareableUrl = `${websiteOrigin}/${vanityUrl}`;
  const shareableDashboardUrl = `${websiteOrigin}/p/${vanityUrl}`;


  const template1 = PlaceHolderImages.find(
    (img) => img.id === 'website-template-1'
  )
  const template2 = PlaceHolderImages.find(
    (img) => img.id === 'website-template-2'
  )
  const previewImage =
    selectedTemplate === 'template-1' ? template1 : template2

  const userWebsiteRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/website`, 'details');
  }, [user, firestore]);


  const resetFormToDefaults = () => {
    setCoupleNames('Alex & Jordan');
    setWeddingDate(new Date());
    setWelcomeMessage('We can\'t wait to celebrate our special day with you! Join us as we say "I do".');
    setVanityUrl(user ? `wedding-${user.uid.slice(0,6)}` : 'our-wedding');
    setShareCode(generateShareCode());
    setSelectedTemplate('template-1');
    setInitialVanityUrl(null);
  }

  useEffect(() => {
    async function fetchWebsiteData() {
        if (userWebsiteRef) {
            setLoading(true);
            const docSnap = await getDoc(userWebsiteRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCoupleNames(data.coupleNames || 'Alex & Jordan');
                setWeddingDate(data.weddingDate ? new Date(data.weddingDate) : new Date());
                setWelcomeMessage(data.welcomeMessage || 'We can\'t wait to celebrate our special day with you! Join us as we say "I do".');
                setVanityUrl(data.vanityUrl || '');
                setShareCode(data.shareCode || generateShareCode());
                setInitialVanityUrl(data.vanityUrl || null);
                setSelectedTemplate(data.templateId || 'template-1');
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
      const finalShareCode = shareCode || generateShareCode();
      if (!shareCode) setShareCode(finalShareCode);

      const dataToSave = {
        coupleNames,
        weddingDate: weddingDate ? weddingDate.toISOString() : null,
        welcomeMessage,
        vanityUrl,
        templateId: selectedTemplate,
        ownerId: user.uid,
        shareCode: finalShareCode,
      };

      // Save to public collection
      const publicWebsiteRef = doc(firestore, 'websites', vanityUrl);
      await setDoc(publicWebsiteRef, dataToSave);
      
      const publicDashboardRef = doc(firestore, 'publicDashboards', vanityUrl);
      await setDoc(publicDashboardRef, { ownerId: user.uid, shareCode: finalShareCode });

      // if vanityUrl changed, delete old public doc
      if (initialVanityUrl && initialVanityUrl !== vanityUrl) {
        const oldPublicWebsiteRef = doc(firestore, 'websites', initialVanityUrl);
        await deleteDoc(oldPublicWebsiteRef);
        const oldPublicDashboardRef = doc(firestore, 'publicDashboards', initialVanityUrl);
        await deleteDoc(oldPublicDashboardRef);
      }
      
      // Save to user's private collection
      await setDoc(userWebsiteRef, dataToSave);

      setInitialVanityUrl(vanityUrl);
      
      toast({
        title: 'Website Published!',
        description: 'Your changes are live and the link is ready to share.',
      })
    } catch (error) {
      console.error('Error saving website:', error)
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Your website details could not be saved. Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
      if (!user || !firestore || !initialVanityUrl) return;

      setIsDeleting(true);
      try {
        // Delete user's private doc
        if(userWebsiteRef) await deleteDoc(userWebsiteRef);
        
        // Delete public doc
        const publicWebsiteRef = doc(firestore, 'websites', initialVanityUrl);
        await deleteDoc(publicWebsiteRef);
        
        const publicDashboardRef = doc(firestore, 'publicDashboards', initialVanityUrl);
        await deleteDoc(publicDashboardRef);


        toast({
            title: "Website Deleted",
            description: "Your wedding website has been successfully deleted.",
        });
        resetFormToDefaults();
      } catch (error) {
          toast({
            variant: "destructive",
            title: "Delete Failed",
            description: "Your website could not be deleted. Please try again.",
          });
      } finally {
          setIsDeleting(false);
      }

  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
       toast({
        title: "Copied to Clipboard!",
        description: "The content is now in your clipboard.",
      });
    });
  };

  const formattedDate = weddingDate ? format(weddingDate, 'MMMM do, yyyy') : 'Select a date'

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Website Builder"
        description="Craft a beautiful home for your wedding story."
      />
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="couple-names">Couple's Names</Label>
                <Input
                  id="couple-names"
                  placeholder="e.g., Alex & Jordan"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wedding-date">Wedding Date</Label>
                <DatePicker
                  date={weddingDate}
                  setDate={setWeddingDate}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  placeholder="Share a message with your guests..."
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Sharing & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                <Label htmlFor="vanity-url">Your Custom URL</Label>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-2.5 rounded-l-md border border-r-0 h-10 flex items-center truncate">
                    {websiteOrigin.replace('https://', '')}/
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
                    <Input id="share-code" value={shareCode} readOnly className="font-mono tracking-widest" />
                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(shareCode)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShareCode(generateShareCode())}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                 </div>
                 <p className="text-xs text-muted-foreground">Share this code with guests so they can view your dashboard.</p>
              </div>
            </CardContent>
           </Card>
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              {template1 && (
                <div
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer ${
                    selectedTemplate === 'template-1'
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                  onClick={() => setSelectedTemplate('template-1')}
                >
                  <Image
                    src={template1.imageUrl}
                    alt={template1.description}
                    width={200}
                    height={150}
                    className="w-full"
                    data-ai-hint={template1.imageHint}
                  />
                  {selectedTemplate === 'template-1' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white bg-primary px-3 py-1 rounded-full text-sm">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              )}
              {template2 && (
                <div
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors ${
                    selectedTemplate === 'template-2'
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                  onClick={() => setSelectedTemplate('template-2')}
                >
                  <Image
                    src={template2.imageUrl}
                    alt={template2.description}
                    width={200}
                    height={150}
                    className="w-full"
                    data-ai-hint={template2.imageHint}
                  />
                  {selectedTemplate === 'template-2' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white bg-primary px-3 py-1 rounded-full text-sm">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
           <div className='flex flex-col gap-2'>
            <Button
              className="w-full"
              size="lg"
              onClick={handleSave}
              disabled={isSaving || loading}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
              <>
                  <Globe className="mr-2 h-4 w-4" /> Save & Publish
              </>
              )}
            </Button>

            {initialVanityUrl && !loading && (
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" disabled={isDeleting}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Website
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              wedding website and all of its data.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Continue
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
           {initialVanityUrl && !loading && (
             <Card>
                <CardHeader>
                    <CardTitle>Your Links are Ready!</CardTitle>
                    <CardDescription>Share your beautiful website and dashboard with your guests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Public Website URL</Label>
                        <div className="flex items-center space-x-2 mt-2">
                             <Input value={shareableUrl} readOnly />
                             <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(shareableUrl)}>
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                             <Link href={shareableUrl} target="_blank">
                                <Button variant="ghost" size="icon"><LinkIcon className="h-4 w-4" /></Button>
                             </Link>
                        </div>
                    </div>
                     <Separator />
                     <div>
                        <Label>Shareable Dashboard URL</Label>
                        <div className="flex items-center space-x-2 mt-2">
                             <Input value={shareableDashboardUrl} readOnly />
                             <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(shareableDashboardUrl)}>
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                             <Link href={shareableDashboardUrl} target="_blank">
                                <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
                             </Link>
                        </div>
                    </div>
                </CardContent>
             </Card>
           )}
           <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-[9/16] bg-muted rounded-lg border overflow-hidden">
                {previewImage && (
                  <div className="relative w-full h-full text-white bg-slate-800">
                    <Image
                      src={previewImage.imageUrl}
                      alt={previewImage.description}
                      fill
                      className="object-cover opacity-30"
                      data-ai-hint={previewImage.imageHint}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <h1 className="font-headline text-4xl font-bold">
                        {coupleNames}
                      </h1>
                      <p className="mt-2 text-md uppercase tracking-widest">
                        Are getting married!
                      </p>
                      <div className="w-16 h-px bg-white my-6" />
                      <p className="text-lg font-semibold">
                        {formattedDate}
                      </p>
                      <p className="mt-6 max-w-md text-sm">
                        {welcomeMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
