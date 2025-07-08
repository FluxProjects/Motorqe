import { IBannerAdsStorage, BannerAdsStorage } from "./storage/bannerAds";
import { IBlogPostStorage, BlogPostStorage } from "./storage/blogPosts";
import { ICarCategoryStorage, CarCategoryStorage } from "./storage/carCategories";
import { ICarEngineCapacityStorage, CarEngineCapacityStorage } from "./storage/carEngineCapacity";
import { ICarFeatureStorage, CarFeatureStorage } from "./storage/carFeatures";
import { ICarInspectionStorage, CarInspectionStorage } from "./storage/carInspection";
import { ICarListingFeatureStorage, CarListingFeatureStorage } from "./storage/carListingFeatures";
import { ICarListingStorage, CarListingStorage } from "./storage/carListings";
import { ICarMakeStorage, CarMakeStorage } from "./storage/carMakes";
import { ICarModelStorage, CarModelStorage } from "./storage/carModels";
import { ICarPartStorage, CarPartStorage } from "./storage/carParts";
import { ICarServiceStorage, CarServiceStorage } from "./storage/carServices";
import { ICarTyreStorage, CarTyreStorage } from "./storage/carTyres";
import { IFavoriteStorage, FavoriteStorage } from "./storage/favourites";
import { IListingPromotionStorage, ListingPromotionStorage } from "./storage/listingPromotions";
import { IMessageStorage, MessageStorage } from "./storage/messages";
import { IPromotionPackageStorage, PromotionPackageStorage } from "./storage/promotionPackages";
import { IReportStorage, ReportStorage } from "./storage/reports";
import { IReviewsStorage, ReviewsStorage } from "./storage/reviews";
import { IRoleStorage, RoleStorage } from "./storage/roles";
import { ISearchHistoryStorage, SearchHistoryStorage } from "./storage/searchHistory";
import { IServiceBookingStorage, ServiceBookingStorage } from "./storage/serviceBookings";
import { IServicePromotionPackageStorage, ServicePromotionPackageStorage } from "./storage/servicePromotionPackages";
import { IServicePromotionStorage, ServicePromotionStorage } from "./storage/servicePromotions";
import { ISettingStorage, SettingStorage } from "./storage/settings";
import { IShowroomStorage, ShowroomStorage } from "./storage/showrooms";
import { IShowroomServiceMakeStorage, ShowroomMakeStorage } from "./storage/showroomServiceMakes";
import { IShowroomServiceStorage, ShowroomServiceStorage } from "./storage/showroomServices";
import { ISliderStorage, SliderStorage } from "./storage/sliders";
import { IStaticContentStorage, StaticContentStorage } from "./storage/staticContent";
import { IStatStorage, StatStorage } from "./storage/stats";
import { IStripeCustomerStorage, StripeCustomerStorage } from "./storage/stripeCustomers";
import { ISubscriptionPlanStorage, SubscriptionPlanStorage } from "./storage/subscriptionPlans";
import { ITransactionStorage, TransactionStorage } from "./storage/transactions";
import { IUserRoleSwitchStorage, UserRoleSwitchStorage } from "./storage/userRolesSwitch";
import { IUserStorage, UserStorage } from "./storage/users";
import { IUserSubscriptionStorage, UserSubscriptionStorage } from "./storage/userSubscriptions";

export interface IStorage
  extends
    IBannerAdsStorage,
    IBlogPostStorage,
    ICarCategoryStorage,
    ICarEngineCapacityStorage,
    ICarFeatureStorage,
    ICarInspectionStorage,
    ICarListingFeatureStorage,
    ICarListingStorage,
    ICarMakeStorage,
    ICarModelStorage,
    ICarPartStorage,
    ICarServiceStorage,
    ICarTyreStorage,
    IFavoriteStorage,
    IListingPromotionStorage,
    IMessageStorage,
    IPromotionPackageStorage,
    IReportStorage,
    IReviewsStorage,
    IRoleStorage,
    ISearchHistoryStorage,
    IServiceBookingStorage,
    IServicePromotionPackageStorage,
    IServicePromotionStorage,
    ISettingStorage,
    IShowroomStorage,
    IShowroomServiceMakeStorage,
    IShowroomServiceStorage,
    ISliderStorage,
    IStaticContentStorage,
    IStatStorage,
    IStripeCustomerStorage,
    ISubscriptionPlanStorage,
    ITransactionStorage,
    IUserRoleSwitchStorage,
    IUserStorage,
    IUserSubscriptionStorage {}

// export const storage = new DatabaseStorage();
export const storage: IStorage = {
  ...BannerAdsStorage,
  ...BlogPostStorage,
  ...CarCategoryStorage,
  ...CarEngineCapacityStorage,
  ...CarFeatureStorage,
  ...CarInspectionStorage,
  ...CarListingFeatureStorage,
  ...CarListingStorage,
  ...CarMakeStorage,
  ...CarModelStorage,
  ...CarPartStorage,
  ...CarServiceStorage,
  ...CarTyreStorage,
  ...FavoriteStorage,
  ...ListingPromotionStorage,
  ...MessageStorage,
  ...PromotionPackageStorage,
  ...ReportStorage,
  ...ReviewsStorage,
  ...RoleStorage,
  ...SearchHistoryStorage,
  ...ServiceBookingStorage,
  ...ServicePromotionPackageStorage,
  ...ServicePromotionStorage,
  ...SettingStorage,
  ...ShowroomStorage,
  ...ShowroomMakeStorage,
  ...ShowroomServiceStorage,
  ...SliderStorage,
  ...StaticContentStorage,
  ...StatStorage,
  ...StripeCustomerStorage,
  ...SubscriptionPlanStorage,
  ...TransactionStorage,
  ...UserRoleSwitchStorage,
  ...UserStorage,
  ...UserSubscriptionStorage,
};
