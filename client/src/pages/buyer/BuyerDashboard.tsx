import { useQuery } from '@tanstack/react-query'; 
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, MessageCircle, Clock, Search } from 'lucide-react';
import { SearchHistory, Favorite, Message } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from "@/components/ProtectedRoute"; 

const BuyerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch saved cars
  const { 
    data: savedCars =[],
    isLoading: isLoadingSaved
  } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
  });
  
  // Fetch recent messages
  const { 
    data: messages = [],
    isLoading: isLoadingMessages
  } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });
  
  // Fetch search history
  const { 
    data: searchHistory=[],
    isLoading: isLoadingHistory
  } = useQuery<SearchHistory[]>({
    queryKey: ['/api/search-history'],
  });
  
  // Dashboard stats
  const { 
    data: stats = [],
    isLoading: isLoadingStats
  } = useQuery<any>({
    queryKey: ['/api/buyer/stats'],
  });
  
  return (
    <ProtectedRoute allowedRoles={["BUYER"]}>
      <div className="min-h-screen bg-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="md:flex">
              {/* Sidebar */}
              <div className="md:w-64">
                <DashboardSidebar type="BUYER" />
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-6">
                <h2 className="text-2xl font-bold mb-6">{t('common.buyerDashboard')}</h2>
                
                {/* Stats Cards */}
                <DashboardStats type="buyer" stats={stats} />
                
                {/* Dashboard Content */}
                <Tabs defaultValue="saved" className="mt-8">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="saved">{t('buyer.savedCars')}</TabsTrigger>
                    <TabsTrigger value="messages">{t('common.messages')}</TabsTrigger>
                    <TabsTrigger value="history">{t('buyer.recentSearches')}</TabsTrigger>
                  </TabsList>
                  
                  {/* Saved Cars Tab */}
                  <TabsContent value="saved" className="mt-6">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{t('buyer.savedCars')}</CardTitle>
                          <Link href="/browse">
                            <Button variant="outline" size="sm">
                              <Search className="h-4 w-4 mr-2" />
                              {t('common.findMoreCars')}
                            </Button>
                          </Link>
                        </div>
                        <CardDescription>
                          {t('buyer.savedCarsDesc')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingSaved ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          </div>
                        ) : savedCars && savedCars.length > 0 ? (
                          <div className="space-y-4">
                            {savedCars.map((item: any) => (
                              <div key={item.car.id} className="flex bg-white rounded-lg border border-neutral-200 overflow-hidden">
                                <div className="w-1/3 max-w-[150px]">
                                  <img 
                                    src={item.car.images[0]} 
                                    alt={item.car.title} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-semibold">{item.car.title}</h4>
                                      <p className="text-sm text-neutral-600">${item.car.price.toLocaleString()}</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-secondary"
                                      onClick={() => {
                                        // Remove from favorites
                                      }}
                                    >
                                      <Heart className="fill-secondary" size={18} />
                                    </Button>
                                  </div>
                                  <div className="mt-2 text-xs text-neutral-500 flex items-center">
                                    <span className="flex items-center mr-3">
                                      <Clock className="mr-1" size={12} />
                                      {new Date(item.car.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {item.car.category.name}
                                    </Badge>
                                    <Link href={`/car/${item.car.id}`}>
                                      <Button variant="link" size="sm" className="h-auto p-0">
                                        {t('common.viewDetails')}
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-neutral-700 mb-1">
                              {t('buyer.noSavedCars')}
                            </h3>
                            <p className="text-neutral-500 mb-4">
                              {t('buyer.startBrowsing')}
                            </p>
                            <Link href="/browse">
                              <Button>
                                {t('common.browseCars')}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Messages Tab */}
                  <TabsContent value="messages" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('common.messages')}</CardTitle>
                        <CardDescription>
                          {t('buyer.messagesDesc')}
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
                                    <p className="text-sm text-neutral-600 font-semibold">{message.car.title}</p>
                                    <p className="text-sm text-neutral-600 mt-1">{message.content}</p>
                                    <div className="mt-2 flex justify-between items-center">
                                      <Link href={`/car/${message.car.id}`}><Button variant="link" size="sm" className="h-auto p-0">{t('common.viewCar')}</Button></Link>
                                      <Button variant="outline" size="sm"> <MessageCircle className="h-4 w-4 mr-1" />{t('common.reply')}</Button>
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
                              {t('buyer.noMessages')}
                            </h3>
                            <p className="text-neutral-500 mb-4">
                              {t('buyer.startMessaging')}
                            </p>
                            <Link href="/browse">
                              <Button>
                                {t('common.browseCars')}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Search History Tab */}
                  <TabsContent value="history" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('buyer.recentSearches')}</CardTitle>
                        <CardDescription>
                          {t('buyer.recentSearchesDesc')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingHistory ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          </div>
                        ) : searchHistory && searchHistory.length > 0 ? (
                          <div className="space-y-2">
                            {searchHistory.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between p-3 rounded-md border border-neutral-200 bg-white">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-neutral-400 mr-2" />
                                  <span className="text-sm">{item.query}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-neutral-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </span>
                                  <Link href={`/browse?q=${encodeURIComponent(item.query)}`}>
                                    <Button variant="ghost" size="sm">
                                      <Search className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Search className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-neutral-700 mb-1">
                              {t('buyer.noSearchHistory')}
                            </h3>
                            <p className="text-neutral-500 mb-4">
                              {t('buyer.startSearching')}
                            </p>
                            <Link href="/browse">
                              <Button>
                                {t('common.browseCars')}
                              </Button>
                            </Link>
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
      </div>
    </ProtectedRoute>
  );
};

export default BuyerDashboard;
