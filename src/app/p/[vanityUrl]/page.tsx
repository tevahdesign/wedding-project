
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { get, ref } from 'firebase/database';
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
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';


type GuestStatus = 'Attending' | 'Pending' | 'Declined';
type Guest = {
  id: string;
  name: string;
  status: GuestStatus;
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

  const vanityUrl = params.vanityUrl as string;

  const [dashboardData, setDashboardData] = useState<PublicDashboardData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [savedVendors, setSavedVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  
  type FilterStatus = GuestStatus | 'All';
  const [brideFilter, setBrideFilter] = useState<FilterStatus>('All');
  const [groomFilter, setGroomFilter] = useState<FilterStatus>('All');

  useEffect(() => {
    const checkAuthAndFetchMeta = async () => {
      if (!database || !vanityUrl) {
          setLoading(false);
          return;
      }
      
      setLoading(true);

      // Handle preview mode for logged-in owner
      if (vanityUrl === 'preview') {
        if (authLoading) return; // Wait for auth state
        if (user) {
          setIsAuthenticated(true);
          const userWebsiteRef = ref(database, `users/${user.uid}/website/details`);
          const snapshot = await get(userWebsiteRef);
          if (snapshot.exists()) {
            setDashboardData({ ownerId: user.uid, ...(snapshot.val() as any) });
          } else {
            setError("You haven't set up your share settings yet.");
          }
        } else {
          setError("You must be logged in to see a preview.");
          router.push('/login?redirect=/p/preview');
        }
        setLoading(false);
        return;
      }

      // Handle regular guest access
      const sessionKey = `dashboard_access_${vanityUrl}`;
      const hasAccessInSession = sessionStorage.getItem(sessionKey) === 'true';

      try {
        const dashboardRef = ref(database, `publicDashboards/${vanityUrl}`);
        const snapshot = await get(dashboardRef);

        if (snapshot.exists()) {
          const data = snapshot.val() as Omit<PublicDashboardData, 'vanityUrl'>;
          setDashboardData({ ...data, vanityUrl });
           if (hasAccessInSession) {
            setIsAuthenticated(true);
          }
        } else {
          setError('This shared dashboard does not exist.');
        }
      } catch (err) {
        setError('Failed to load dashboard information.');
      } finally {
        if (!hasAccessInSession) {
            setLoading(false);
        }
      }
    };

    checkAuthAndFetchMeta();
  }, [database, vanityUrl, user, authLoading, router]);


  useEffect(() => {
    if (!dashboardData?.ownerId || !database || !isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const ownerId = dashboardData.ownerId;
        const userRef = ref(database, `users/${ownerId}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            const details = userData.website?.details || {};

            setProfile({
              displayName: details.coupleNames || 'The Happy Couple',
              photoURL: userData.photoURL || ''
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

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dashboardData && accessCodeInput.toUpperCase() === dashboardData.shareCode) {
        const sessionKey = `dashboard_access_${vanityUrl}`;
        sessionStorage.setItem(sessionKey, 'true');
        setIsAuthenticated(true);
        setError(null);
    } else {
        setError('Invalid access code. Please try again.');
    }
  }
  
  const guestStats = useMemo(() => {
    const initialStats = { total: 0, attending: 0, pending: 0, declined: 0 };
    
    const stats = {
        total: guests.length,
        attending: guests.filter(g => g.status === 'Attending').length,
        pending: guests.filter(g => g.status === 'Pending').length,
        declined: guests.filter(g => g.status === 'Declined').length,
        bride: { ...initialStats, guests: [] as Guest[] },
        groom: { ...initialStats, guests: [] as Guest[] },
        other: { ...initialStats, guests: [] as Guest[] }
    };

    guests.forEach(guest => {
        let group: 'bride' | 'groom' | 'other' = 'other';
        if (guest.group?.toLowerCase() === 'bride') {
            group = 'bride';
        } else if (guest.group?.toLowerCase() === 'groom') {
            group = 'groom';
        }
        
        stats[group].total++;
        stats[group].guests.push(guest);
        if (guest.status === 'Attending') stats[group].attending++;
        else if (guest.status === 'Pending') stats[group].pending++;
        else if (guest.status === 'Declined') stats[group].declined++;
    });

    return stats;
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
  
  const SkeletonLoader = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    </div>
  );


  if (loading && !dashboardData && !error) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Loading Shared Dashboard...</p>
      </div>
    );
  }

  if (error && !isAuthenticated) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        <Card className="w-full max-w-sm z-10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline text-destructive">Error</CardTitle>
            <CardDescription>
                {error}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/')} className="w-full">
                Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
     )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        <Card className="w-full max-w-sm z-10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Dashboard Access</CardTitle>
            <CardDescription>
              Enter the access code to view the wedding plan for <span className="font-bold text-primary">{vanityUrl}</span>.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCodeSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <Input
                  id="access-code"
                  type="text"
                  placeholder="Enter code..."
                  value={accessCodeInput}
                  onChange={(e) => setAccessCodeInput(e.target.value)}
                  required
                  className="font-mono tracking-widest text-center"
                />
              </div>
              {error && <div className="text-sm text-destructive text-center">{error}</div>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                 <KeyRound className="mr-2 h-4 w-4" /> Unlock Dashboard
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  const renderGuestGroupStats = (
      title: string, 
      stats: { total: number, attending: number, pending: number, declined: number },
      activeFilter: FilterStatus,
      setFilter: (status: FilterStatus) => void
    ) => {
    
    const statItems: { label: GuestStatus, value: number, color: string }[] = [
        { label: 'Attending', value: stats.attending, color: 'text-green-500' },
        { label: 'Pending', value: stats.pending, color: 'text-yellow-500' },
        { label: 'Declined', value: stats.declined, color: 'text-red-500' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{title} ({stats.total} Guests)</h4>
                {activeFilter !== 'All' && (
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setFilter('All')}>
                        Clear filter
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                {statItems.map(item => (
                    <div 
                        key={item.label}
                        onClick={() => setFilter(item.label)}
                        className={cn(
                            "p-2 rounded-md cursor-pointer transition-colors",
                            activeFilter === item.label ? 'bg-primary/20' : 'bg-muted/50 hover:bg-muted'
                        )}
                    >
                        <div className={`font-bold ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
  };
  
  const renderGuestListTable = (guests: Guest[], filter: FilterStatus) => {
    const filteredGuests = filter === 'All' ? guests : guests.filter(g => g.status === filter);
    
    if (filteredGuests.length === 0) return (
        <div className="text-muted-foreground text-center py-8">
            {filter === 'All' ? 'No guests in this group.' : `No guests with status "${filter}".`}
        </div>
    );

    return (
        <div className="max-h-60 overflow-y-auto border rounded-lg">
            <Table>
                <TableHeader className="sticky top-0 bg-muted">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredGuests.map(guest => (
                        <TableRow key={guest.id}>
                            <TableCell>{guest.name}</TableCell>
                            <TableCell className="text-right flex justify-end items-center gap-2">
                                {getStatusIcon(guest.status)} {guest.status}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
  };


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
              <div className="text-sm text-muted-foreground">The Wedding Plan for</div>
              <h1 className="text-lg font-bold">{profile?.displayName || 'The Happy Couple'}</h1>
            </div>
          </div>
          <span className="text-2xl font-logo text-primary">WedWise</span>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs defaultValue="guests" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="guests">
                    <Users className="mr-2 h-4 w-4"/>Guests
                </TabsTrigger>
                <TabsTrigger value="budget">
                    <PiggyBank className="mr-2 h-4 w-4"/>Budget
                </TabsTrigger>
                <TabsTrigger value="vendors">
                    <Heart className="mr-2 h-4 w-4"/>Vendors
                </TabsTrigger>
            </TabsList>

            <TabsContent value="guests">
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    Guest List Overview
                    </CardTitle>
                     {loading ? (
                        <div className="text-sm text-muted-foreground"><Skeleton className="h-4 w-24" /></div>
                    ) : (
                        <CardDescription>{`${guestStats.total} guests invited`}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    {loading ? <SkeletonLoader /> : (
                        <>
                            <div className="grid grid-cols-3 gap-4 text-center mb-6 p-4 border rounded-lg">
                            <div>
                                <div className="text-2xl font-bold text-green-500">{guestStats.attending}</div>
                                <div className="text-sm text-muted-foreground">Attending</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-500">{guestStats.pending}</div>
                                <div className="text-sm text-muted-foreground">Pending</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-500">{guestStats.declined}</div>
                                <div className="text-sm text-muted-foreground">Declined</div>
                            </div>
                            </div>
                            
                            {guests.length > 0 ? (
                                <Tabs defaultValue="bride" className="w-full mt-6">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="bride">Bride's Guests ({guestStats.bride.guests.length})</TabsTrigger>
                                        <TabsTrigger value="groom">Groom's Guests ({guestStats.groom.guests.length})</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="bride" className="mt-4 space-y-4">
                                        {renderGuestGroupStats("Bride's Side", guestStats.bride, brideFilter, setBrideFilter)}
                                        {renderGuestListTable(guestStats.bride.guests, brideFilter)}
                                    </TabsContent>
                                    <TabsContent value="groom" className="mt-4 space-y-4">
                                        {renderGuestGroupStats("Groom's Side", guestStats.groom, groomFilter, setGroomFilter)}
                                        {renderGuestListTable(guestStats.groom.guests, groomFilter)}
                                    </TabsContent>
                                </Tabs>
                            ) : (<div className="text-muted-foreground text-center py-8">The guest list is not available yet.</div>)}
                        </>
                    )}
                </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="budget">
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    Budget Overview
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                        {loading ? <Skeleton className="h-4 w-40" /> : `₹${budgetStats.totalSpent.toLocaleString('en-IN')} spent of ₹${budgetStats.totalBudgeted.toLocaleString('en-IN')}`}
                    </div>
                </CardHeader>
                <CardContent>
                     {loading ? <SkeletonLoader /> : (
                        <>
                            <Progress value={budgetStats.progress} className="mb-2" />
                            <div className={cn("text-sm font-medium", budgetStats.remaining < 0 ? "text-destructive" : "text-muted-foreground")}>
                                {budgetStats.remaining >= 0
                                    ? `₹${budgetStats.remaining.toLocaleString('en-IN')} remaining`
                                    : `₹${Math.abs(budgetStats.remaining).toLocaleString('en-IN')} over budget`
                                }
                            </div>
                            {budgetItems.length > 0 ? (
                                <div className="mt-4 max-h-96 overflow-y-auto">
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
                            ) : (<div className="text-muted-foreground text-center py-8">The budget details are not available yet.</div>)}
                        </>
                     )}
                </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="vendors">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        Saved Vendors
                        </CardTitle>
                         {loading ? (
                            <div className="text-sm text-muted-foreground"><Skeleton className="h-4 w-24" /></div>
                        ) : (
                            <CardDescription>{`${savedVendors.length} vendors saved`}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {loading ? <SkeletonLoader /> : savedVendors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {savedVendors.map(vendor => (
                            <Link href={`/v/${vendor.id}`} key={vendor.id} className="group">
                                <Card className="h-full hover:shadow-md transition-shadow">
                                <CardContent className="p-3 flex items-center gap-3">
                                    <Store className="w-8 h-8 text-primary flex-shrink-0" />
                                    <div className="flex-grow min-w-0">
                                        <p className="font-semibold truncate">{vendor.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{vendor.category}</p>
                                    </div>
                                </CardContent>
                                </Card>
                            </Link>
                            ))}
                        </div>
                        ) : (
                        <div className="text-muted-foreground text-center py-8">No vendors have been saved yet.</div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

