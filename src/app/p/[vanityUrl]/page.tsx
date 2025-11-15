

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
        setLoading(false);
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

  if (loading && !dashboardData) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Loading Shared Dashboard...</p>
      </div>
    );
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
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
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
                  <Link href={`/vendors/${vendor.id}`} key={vendor.id} className="group">
                    <Card className="h-full">
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
              <p className="text-muted-foreground text-center py-8">No vendors have been saved yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
