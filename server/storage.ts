import { IUserSubscriptionStorage, UserSubscriptionStorage } from "./storage/userSubscriptions";
import { IUserStorage, UserStorage } from "./storage/users";
import { IRoleStorage, RoleStorage } from "./storage/roles";
import { CarCategoryStorage, ICarCategoryStorage } from "./storage/carCategories";
import { CarFeatureStorage, ICarFeatureStorage } from "./storage/carFeatures";
import { CarListingFeatureStorage, ICarListingFeatureStorage } from "./storage/carListingFeatures";
import { CarListingStorage, ICarListingStorage } from "./storage/carListings";
import { CarMakeStorage, ICarMakeStorage } from "./storage/carMakes";
import { CarModelStorage, ICarModelStorage } from "./storage/carModels";
import { CarServiceStorage, ICarServiceStorage } from "./storage/carServices";
import { FavoriteStorage, IFavoriteStorage } from "./storage/favourites";
import { IListingPromotionStorage, ListingPromotionStorage } from "./storage/listingPromotions";
import { IMessageStorage, MessageStorage } from "./storage/messages";
import { IPromotionPackageStorage, PromotionPackageStorage } from "./storage/promotionPackages";
import { IReportStorage, ReportStorage } from "./storage/reports";
import { ISearchHistoryStorage, SearchHistoryStorage } from "./storage/searchHistory";
import { IServiceBookingStorage, ServiceBookingStorage } from "./storage/serviceBookings";
import { IServicePromotionPackageStorage, ServicePromotionPackageStorage } from "./storage/servicePromotionPackages";
import { IServicePromotionStorage, ServicePromotionStorage } from "./storage/servicePromotions";
import { ISettingStorage, SettingStorage } from "./storage/settings";
import { IShowroomStorage, ShowroomStorage } from "./storage/showrooms";
import { IShowroomServiceMakeStorage, ShowroomMakeStorage } from "./storage/showroomServiceMakes";
import { IShowroomServiceStorage, ShowroomServiceStorage } from "./storage/showroomServices";
import { IStaticContentStorage, StaticContentStorage } from "./storage/staticContent";
import { IStripeCustomerStorage, StripeCustomerStorage } from "./storage/stripeCustomers";
import { ISubscriptionPlanStorage, SubscriptionPlanStorage } from "./storage/subscriptionPlans";
import { ITransactionStorage, TransactionStorage } from "./storage/transactions";
import { IUserRoleSwitchStorage, UserRoleSwitchStorage } from "./storage/userRolesSwitch";
import { CarEngineCapacityStorage, ICarEngineCapacityStorage } from "./storage/carEngineCapacity";
import { IStatStorage, StatStorage } from "./storage/stats";
import { CarInspectionStorage, ICarInspectionStorage } from "./storage/carInspection";
import { ISliderStorage, SliderStorage } from "./storage/sliders";
import { BlogPostStorage, IBlogPostStorage } from "./storage/blogPosts";
import { BannerAdsStorage, IBannerAdsStorage } from "./storage/bannerAds";

export interface IStorage 
extends
ICarCategoryStorage,
ICarEngineCapacityStorage,
ICarFeatureStorage,
ICarListingFeatureStorage,
ICarListingStorage,
ICarMakeStorage,
ICarModelStorage,
ICarServiceStorage,
IFavoriteStorage,
IListingPromotionStorage,
IMessageStorage,
IPromotionPackageStorage,
IReportStorage,
IRoleStorage,
ISearchHistoryStorage,
IServiceBookingStorage,
IServicePromotionPackageStorage,
IServicePromotionStorage,
ISettingStorage,
IShowroomStorage,
IShowroomServiceMakeStorage,
IShowroomServiceStorage,
IStaticContentStorage,
IStripeCustomerStorage,
ISubscriptionPlanStorage,
ITransactionStorage,
IUserRoleSwitchStorage,
IUserStorage,
IUserSubscriptionStorage,
IStatStorage,
ICarInspectionStorage,
ISliderStorage,
IBlogPostStorage,
IBannerAdsStorage
{ }


// export const storage = new DatabaseStorage();
export const storage: IStorage = {
...CarCategoryStorage,
...CarEngineCapacityStorage,
...CarFeatureStorage,
...CarListingFeatureStorage,
...CarListingStorage,
...CarMakeStorage,
...CarModelStorage,
...CarServiceStorage,
...FavoriteStorage,
...ListingPromotionStorage,
...MessageStorage,
...PromotionPackageStorage,
...ReportStorage,
...RoleStorage,
...SearchHistoryStorage,
...ServiceBookingStorage,
...ServicePromotionPackageStorage,
...ServicePromotionStorage,
...SettingStorage,
...ShowroomStorage,
...ShowroomMakeStorage,
...ShowroomServiceStorage,
...StaticContentStorage,
...StripeCustomerStorage,
...SubscriptionPlanStorage,
...TransactionStorage,
...UserRoleSwitchStorage,
...UserStorage,
...UserSubscriptionStorage,
...StatStorage,
...CarInspectionStorage,
...SliderStorage,
...BlogPostStorage,
...BannerAdsStorage
};