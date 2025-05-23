import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  PlusCircle,
  Eye,
  MessageCircle,
  BarChart3,
  Edit,
  MoreHorizontal,
  Trash2,
  Check,
  X,
  AlertCircle,
  Car
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CarListing, Message } from '@shared/schema';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from '@/contexts/AuthContext';

const ShowroomDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const auth = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<number | null>(null);
  
    const { data: user, status, refetch, error, isError } = useQuery({
    queryKey: ['user', auth.user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${auth.user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!auth.user?.id,
  });
  // Fetch seller listings
  const { 
    data: listings = [],
    isLoading: isLoadingListings
  } = useQuery<CarListing[]>({
    queryKey: ['/api/seller/listings'],
  });
  
  // Fetch messages from buyers
  const { 
    data: messages = [],
    isLoading: isLoadingMessages
  } = useQuery<Message[]>({
    queryKey: ['/api/seller/messages'],
  });
  
  // Fetch listing statistics
  const { 
    data: stats = [],
    isLoading: isLoadingStats
  } = useQuery<any>({
    queryKey: ['/api/seller/stats'],
  });
  
  // Mutation for deleting a listing
  const deleteListing = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cars/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: t('seller.listingDeleted'),
        description: t('seller.listingDeletedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/stats'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('seller.listingDeleteError'),
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for marking a listing as sold
  const markAsSold = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PATCH', `/api/cars/${id}/status`, { status: 'sold' });
    },
    onSuccess: () => {
      toast({
        title: t('seller.listingMarkedAsSold'),
        description: t('seller.listingMarkedAsSoldDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/stats'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('seller.statusUpdateError'),
        variant: 'destructive',
      });
    },
  });
  
  const handleDeleteListing = (id: number) => {
    setListingToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteListing = () => {
    if (listingToDelete) {
      deleteListing.mutate(listingToDelete);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };
  
  const handleMarkAsSold = (id: number) => {
    markAsSold.mutate(id);
  };
  
  // Dashboard stats
  const dashboardStats = [
    {
      title: t('seller.activeListings'),
      value: stats?.activeListings || 0,
      icon: 'ri-car-line',
    },
    {
      title: t('seller.totalViews'),
      value: stats?.totalViews || 0,
      icon: 'ri-eye-line',
    },
    {
      title: t('common.unreadMessages'),
      value: stats?.unreadMessages || 0,
      icon: 'ri-message-3-line',
    },
    {
      title: t('buyer.savedCars'),
      value: stats?.favorites || 0,
      icon: 'ri-heart-line',
    },
  ];
  

  return (
    <ProtectedRoute allowedRoles={["DEALER"]}>
      <div className="min-h-screen bg-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="md:flex">
              {/* Sidebar */}
              <div className="md:w-64">
                <DashboardSidebar type="DEALER" />
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{t('common.dashboard', "Dashboard")}</h2>
                  <Link href="/sell-car">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {t('seller.addNewListing')}
                    </Button>
                  </Link>
                </div>
                
                {/* Stats Cards */}
                <DashboardStats type="seller" stats={dashboardStats} />
                
                {/* Dashboard Content */}
                <Tabs defaultValue="listings" className="mt-8">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="listings">{t('seller.myListings')}</TabsTrigger>
                    <TabsTrigger value="messages">{t('seller.messagesBuyers')}</TabsTrigger>
                    <TabsTrigger value="settings">{t('seller.settings')}</TabsTrigger>
                  </TabsList>
                  
                  {/* My Listings Tab */}
                  <TabsContent value="listings" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('seller.myListings')}</CardTitle>
                        <CardDescription>
                          {t('seller.manageYourListings')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingListings ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          </div>
                        ) : listings && listings.length > 0 ? (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t('car.carDetails')}</TableHead>
                                  <TableHead>{t('common.price')}</TableHead>
                                  <TableHead>{t('seller.listingStatus')}</TableHead>
                                  <TableHead>{t('seller.totalViews')}</TableHead>
                                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {listings.map((listing: any) => (
                                  <TableRow key={listing.id}>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 rounded overflow-hidden bg-neutral-100 mr-3">
                                          {listing.images && listing.images.length > 0 && (
                                            <img
                                              src={listing.images[0]}
                                              alt={listing.title}
                                              className="h-full w-full object-cover"
                                            />
                                          )}
                                        </div>
                                        <div>
                                          <div className="font-medium">{listing.title}</div>
                                          <div className="text-sm text-neutral-500">
                                            {new Date(listing.createdAt).toLocaleDateString()}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      ${listing.price.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                      {StatusBadge(listing.status)}
                                    </TableCell>
                                    <TableCell>
                                      {listing.views}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                                          <DropdownMenuItem asChild>
                                            <Link href={`/car/${listing.id}`}>
                                              <Eye className="mr-2 h-4 w-4" />
                                              {t('common.view')}
                                            </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem asChild>
                                            <Link href={`/sell/edit/${listing.id}`}>
                                              <Edit className="mr-2 h-4 w-4" />
                                              {t('common.edit')}
                                            </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          {listing.status !== 'sold' && (
                                            <DropdownMenuItem onClick={() => handleMarkAsSold(listing.id)}>
                                              <Check className="mr-2 h-4 w-4" />
                                              {t('seller.markAsSold')}
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem 
                                            className="text-red-600" 
                                            onClick={() => handleDeleteListing(listing.id)}
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('common.delete')}
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Car className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-neutral-700 mb-1">
                              {t('seller.noListings')}
                            </h3>
                            <p className="text-neutral-500 mb-4">
                              {t('seller.startSellingDesc')}
                            </p>
                           {user?.role_id === 3 ? (
                              <Link href="/sell-car">
                                <Button type="button">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  {t('seller.addNewListing')}
                                </Button>
                              </Link>
                            ) : user?.role_id === 4 ? (
                              <Link href="/sell-service">
                                <Button type="button">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  {t('garage.addNewService')}
                                </Button>
                              </Link>
                            ) : null}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Messages Tab */}
                  <TabsContent value="messages" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('seller.messagesBuyers')}</CardTitle>
                        <CardDescription>
                          {t('seller.messagesBuyersDesc')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingMessages ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          </div>
                        ) : messages && messages.length > 0 ? (
                          <div className="space-y-4">
                            {messages.map((message: any) => (
                              <div key={message.id} className={`p-4 rounded-lg ${message.isRead ? 'bg-white border border-neutral-200' : 'bg-blue-50 border border-blue-100'}`}>
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={message.sender.avatar} alt={message.sender.username} />
                                    <AvatarFallback>{message.sender.username.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-semibold">{message.sender.username}</h4>
                                      <span className="text-xs text-neutral-500">
                                        {new Date(message.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-neutral-600 font-semibold">
                                      RE: {message.car.title}
                                    </p>
                                    <p className="text-sm text-neutral-600 mt-1">
                                      {message.content}
                                    </p>
                                    <div className="mt-2 flex justify-between items-center">
                                      <Link href={`/car/${message.car.id}`}>
                                        <Button variant="link" size="sm" className="h-auto p-0">
                                          {t('common.viewCar')}
                                        </Button>
                                      </Link>
                                      <Button variant="outline" size="sm">
                                        <MessageCircle className="h-4 w-4 mr-1" />
                                        {t('common.reply')}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-neutral-700 mb-1">
                              {t('seller.noMessages')}
                            </h3>
                            <p className="text-neutral-500 mb-4">
                              {t('seller.noMessagesDesc')}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Statistics Tab */}
                  <TabsContent value="statistics" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('seller.statistics')}</CardTitle>
                        <CardDescription>
                          {t('seller.statisticsDesc')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingStats ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          </div>
                        ) : stats ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                                <h3 className="text-sm font-medium text-neutral-600 mb-2">{t('seller.listingStatuses')}</h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{t('seller.active')}</span>
                                    <span className="font-medium">{stats.statusCounts?.active || 0}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{t('seller.pending')}</span>
                                    <span className="font-medium">{stats.statusCounts?.pending || 0}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{t('seller.sold')}</span>
                                    <span className="font-medium">{stats.statusCounts?.sold || 0}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{t('seller.rejected')}</span>
                                    <span className="font-medium">{stats.statusCounts?.rejected || 0}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                                <h3 className="text-sm font-medium text-neutral-600 mb-2">{t('seller.performance')}</h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{t('seller.averageViews')}</span>
                                    <span className="font-medium">{stats.averageViews || 0}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{t('seller.messageResponseRate')}</span>
                                    <span className="font-medium">{stats.responseRate || 0}%</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{t('seller.averageTimeToSell')}</span>
                                    <span className="font-medium">{stats.avgDaysToSell || 0} {t('common.days')}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{t('seller.favoriteRate')}</span>
                                    <span className="font-medium">{stats.favoriteRate || 0}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                              <h3 className="text-sm font-medium text-neutral-600 mb-4">{t('seller.topPerformingListings')}</h3>
                              {stats.topListings && stats.topListings.length > 0 ? (
                                <div className="space-y-3">
                                  {stats.topListings.map((listing: any) => (
                                    <div key={listing.id} className="flex justify-between items-center p-2 bg-white rounded border border-neutral-100">
                                      <div className="flex items-center">
                                        {listing.images && listing.images.length > 0 && (
                                          <div className="w-10 h-10 rounded overflow-hidden mr-3">
                                            <img
                                              src={listing.images[0]}
                                              alt={listing.title}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <div>
                                          <div className="font-medium text-sm">{listing.title}</div>
                                          <div className="text-xs text-neutral-500">${listing.price.toLocaleString()}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="flex flex-col items-end mr-4">
                                          <span className="text-sm font-medium">{listing.views}</span>
                                          <span className="text-xs text-neutral-500">{t('common.views')}</span>
                                        </div>
                                        <Eye className="h-4 w-4 text-neutral-400" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-sm text-neutral-500">
                                  {t('seller.noTopListings')}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-neutral-700 mb-1">
                              {t('seller.noStats')}
                            </h3>
                            <p className="text-neutral-500 mb-4">
                              {t('seller.noStatsDesc')}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('seller.confirmDeleteListing')}</DialogTitle>
              <DialogDescription>
                {t('seller.confirmDeleteListingDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-between mt-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteListing}
                disabled={deleteListing.isPending}
              >
                {deleteListing.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {t('common.delete')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default ShowroomDashboard;
