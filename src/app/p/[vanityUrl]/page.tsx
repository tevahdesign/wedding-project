

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { get, ref, child } from 'firebase/database';
import { useDatabase, useAuth } from '@/firebase';
import {
  Heart,
  Loader2,
  Users,
  PiggyBank,
  CheckCircle,
  Circle,
  XCircle,
  Store,
  KeyRound,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Guest = {
  id: string;
  name: string;
  status: 'Attending' | 'Pending' | 'Declined';
  group?: string;
};

type BudgetItem = {
  id: string;
  name: string;
  budget: number;
  spent: number;
};

type Vendor = {
  id: string;
  name: string;
  category: string;
  imageId: string;
};

type UserProfile = {
  displayName: string;
  photoURL: string;
};

type PublicDashboardData = {
    ownerId: string;
    shareCode: string;
    vanityUrl: string;
    coupleNames?: string;
};


export default function PublicDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const database = useDatabase();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  const vanityUrl = params.vanityUrl as string;

  const [dashboardData, setDashboardData] = useState<PublicDashboardData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [savedVendors, setSavedVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  // This effect runs only once to check session storage.
  useEffect(() => {
    const sessionKey = `dashboard_access_${vanityUrl}`;
    const hasAccess = sessionStorage.getItem(sessionKey) === 'true';
    
    // Also check if owner is viewing
    const isOwnerViewingPreview = vanityUrl === 'preview' && user;

    if (hasAccess || isOwnerViewingPreview) {
      setIsAuthenticated(true);
    }
  }, [vanityUrl, user]);


  useEffect(() => {
    const fetchDashboardMeta = async () => {
      if (!database || !vanityUrl) return;

      if (vanityUrl === 'preview') {
         if (authLoading) return;
         if (user) {
            const userWebsiteRef = ref(database, `users/${user.uid}/website/details`);
            const snapshot = await get(userWebsiteRef);
            if (snapshot.exists()) {
                setDashboardData({ ownerId: user.uid, ...(snapshot.val() as any) });
            } else {
                 setError("You haven't set up your share settings yet.");
            }
         } else {
            setError("You must be logged in to see a preview.");
         }
         setLoading(false);
         return;
      }
      
      try {
        const dashboardRef = ref(database, `publicDashboards/${vanityUrl}`);
        const snapshot = await get(dashboardRef);
        if (snapshot.exists()) {
          const data = snapshot.val() as Omit<PublicDashboardData, 'vanityUrl'>;
          setDashboardData({ ...data, vanityUrl });

          const code = searchParams.get('code');
          if (code) {
             if (code.toUpperCase() === data.shareCode) {
                sessionStorage.setItem(`dashboard_access_${vanityUrl}`, 'true');
                setIsAuthenticated(true);
                router.replace(`/p/${vanityUrl}`);
             } else {
                setError('Invalid access code provided.');
             }
          }

        } else {
          setError('This shared dashboard does not exist.');
        }
      } catch (err) {
        setError('Failed to load dashboard information.');
      } finally {
        if (vanityUrl !== 'preview') {
            setLoading(false);
        }
      }
    };
    fetchDashboardMeta();
  }, [database, vanityUrl, user, authLoading, searchParams, router]);

  useEffect(() => {
    if (!dashboardData?.ownerId || !database || !isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const ownerId = dashboardData.ownerId;
        const userSnapshot = await get(ref(database, `users/${ownerId}`));
        
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            const details = userData.website?.details || {};

            setProfile({
              displayName: details.coupleNames || 'The Happy Couple',
              photoURL: userData.photoURL || '' // Assuming photoURL might be at the root of user data
            });

            const guestList: Guest[] = userData.guests ? Object.keys(userData.guests).map(key => ({ id: key, ...userData.guests[key]})) : [];
            setGuests(guestList);

            const budgetList: BudgetItem[] = userData.budgetItems ? Object.keys(userData.budgetItems).map(key => ({ id: key, ...userData.budgetItems[key]})) : [];
            setBudgetItems(budgetList);

            const vendorList: Vendor[] = userData.myVendors ? Object.keys(userData.myVendors).map(key => ({ id: key, ...userData.myVendors[key]})) : [];
            setSavedVendors(vendorList);
        } else {
            setError('Could not find data for this user.');
        }

      } catch (err) {
        console.error(err);
        setError('There was an error fetching the planning details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dashboardData, database, isAuthenticated]);
  
  const guestStats = useMemo(() => {
    const attending = guests.filter(g => g.status === 'Attending').length;
    const pending = guests.filter(g => g.status === 'Pending').length;
    const declined = guests.filter(g => g.status === 'Declined').length;
    const total = guests.length;
    return { attending, pending, declined, total };
  }, [guests]);

  const budgetStats = useMemo(() => {
    const totalSpent = budgetItems.reduce((sum, item) => sum + (Number(item.spent) || 0), 0);
    const totalBudgeted = budgetItems.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
    const remaining = totalBudgeted - totalSpent;
    const progress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    return { totalSpent, totalBudgeted, remaining, progress };
  }, [budgetItems]);
  
  const getStatusIcon = (status: Guest['status']) => {
    if (status === 'Attending') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'Pending') return <Circle className="h-4 w-4 text-yellow-500" />;
    if (status === 'Declined') return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Loading Shared Dashboard...</p>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted text-center p-4">
        <div>
          <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground">{error || 'Please use the guest login page to access this dashboard.'}</p>
          <Button onClick={() => router.push('/guest-login')} className="mt-6">Go to Guest Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted min-h-screen">
      <header className="bg-background shadow-sm sticky top-0 z-20">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile?.photoURL || ''} alt={profile?.displayName} />
              <AvatarFallback>{profile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">The Wedding Plan for</p>
              <h1 className="text-lg font-bold">{profile?.displayName || 'The Happy Couple'}</h1>
            </div>
          </div>
          <span className="text-2xl font-logo text-primary">WedWise</span>
        </div>
      </header>

      <main className="container mx-auto p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Guest List Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users /> Guest List Overview
            </CardTitle>
            <CardDescription>{guestStats.total} guests invited</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-green-500">{guestStats.attending}</p>
                <p className="text-sm text-muted-foreground">Attending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{guestStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{guestStats.declined}</p>
                <p className="text-sm text-muted-foreground">Declined</p>
              </div>
            </div>
            {guests.length > 0 && (
                <div className="mt-4 max-h-60 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Group</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guests.map(guest => (
                                <TableRow key={guest.id}>
                                    <TableCell>{guest.name}</TableCell>
                                    <TableCell><Badge variant="secondary">{guest.group || 'N/A'}</Badge></TableCell>
                                    <TableCell className="text-right flex justify-end items-center gap-2">
                                        {getStatusIcon(guest.status)} {guest.status}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Tracker Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank /> Budget Overview
            </CardTitle>
             <CardDescription>
                ₹{budgetStats.totalSpent.toLocaleString('en-IN')} spent of ₹{budgetStats.totalBudgeted.toLocaleString('en-IN')}
             </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={budgetStats.progress} className="mb-2" />
            <p className={cn("text-sm font-medium", budgetStats.remaining < 0 ? "text-destructive" : "text-muted-foreground")}>
                {budgetStats.remaining >= 0
                    ? `₹${budgetStats.remaining.toLocaleString('en-IN')} remaining`
                    : `₹${Math.abs(budgetStats.remaining).toLocaleString('en-IN')} over budget`
                }
            </p>
             {budgetItems.length > 0 && (
                <div className="mt-4 max-h-60 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Spent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budgetItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">₹{Number(item.spent).toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
             )}
          </CardContent>
        </Card>

        {/* Saved Vendors Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart /> Saved Vendors
            </CardTitle>
            <CardDescription>{savedVendors.length} vendors saved</CardDescription>
          </CardHeader>
          <CardContent>
            {savedVendors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {savedVendors.map(vendor => (
                  <Card key={vendor.id}>
                    <CardContent className="p-3 flex items-center gap-3">
                        <Store className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold truncate">{vendor.name}</p>
                            <p className="text-sm text-muted-foreground">{vendor.category}</p>
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No vendors have been saved yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    