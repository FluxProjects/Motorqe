import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/ui/image-upload";
import MultiImageUpload from "@/components/ui/multi-image-upload";
import GoogleMaps from "@/components/ui/google-maps";

import { 
  ChevronRight,
  Plus,
  Trash,
  ArrowRight,
  ArrowLeft,
  MapPin as MapPinIcon
} from "lucide-react";
import { insertShowroomSchema, Showroom, User } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import Footer from "@/components/layout/Footer";


type ServiceForm = {
  serviceId: string;
  price: number;
  description: string;
  featured: boolean;
};

export default function AdminAddGarage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [garageLogo, setGarageLogo] = useState<string>("");
  const [garageImages, setGarageImages] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceForm[]>([
    { serviceId: "", price: 0, description: "", featured: false }
  ]);

  const [contact, setContact] = useState<any>([
    {
      username: "",
      firstName: null,
      lastName: null,
      email: "",
      phone: null,
      password: "",
      
    }
  ]);

  // Fetch car services for dropdown
  const { data: carServices = [] } = useQuery<CarService[]>({
    queryKey: ["car-services"],
    queryFn: () => apiRequest("GET", "/api/services").then(res => res.json()),
  });

  const form = useForm<Showroom>({
    resolver: zodResolver(insertShowroomSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      address: "",
      addressAr: "",
      location: "",
      phone: "",
      timing: "",
      isMainBranch: false,
      logo: "",
      images: [],
      isGarage: true,
      isMobileService: false,
      isFeatured: false
    },
  });

  

  // Modify your handleSubmit function in AdminAddGarage component
  const handleSubmit = async () => {
    console.log("Submit initiated");
    
    // Manually get form values instead of relying onSubmit
    const formValues = form.getValues();
    
    try {
      // Validate all fields
  

      // Check required files
      if (!garageLogo) {
        toast({ title: "Error", description: "Logo is required" });
        return;
      }

      const contactEmail = contact.email;

    const username = contactEmail.split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '') // Remove special chars except underscore
      .toLowerCase(); // Convert to lowercase

    if (!username) {
      throw new Error("Invalid email format for username generation");
    }

      console.log("Submitting:", { formValues, garageLogo, garageImages, services });

      // 1. First register the user (using contact form data)
      const userRegistrationData = {
        username: username,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        password: "defaultPassword123", // You might want to generate this or have user input
        confirmPassword: "defaultPassword123",
        role: "GARAGE", // Or whatever role you need
        termsAgreement: true
      };

      const registerResponse = await apiRequest("POST", "/api/auth/register", userRegistrationData);
      if (!registerResponse.ok) {
        throw new Error("Failed to register user");
      }
      
      const { user: registeredUser } = await registerResponse.json();
      console.log("user registered", user);
      // 2. Then create the garage with the registered user's ID
      const garageResponse = await apiRequest("POST", "/api/showrooms", {
        ...formValues,
        logo: garageLogo,
        images: garageImages,
        isGarage: true,
        userId: registeredUser.id, // Use the registered user's ID
      });

      if (!garageResponse.ok) {
        throw new Error("Failed to create garage");
      }

      const garage = await garageResponse.json();
      console.log("garage registered", garage);

      // 3. Finally create services for the garage
      if (services.length > 0) {
        await Promise.all(
          services.map(async (service, index) => {
            const servicePayload = {
              showroomId: garage.id,
              serviceId: service.serviceId,
              price: service.price,
              description: service.description,
              featured: service.featured,
              status: "active",
            };

            console.log(`Creating service ${index + 1}:`, servicePayload);

            const response = await apiRequest("POST", "/api/showroom/services/", servicePayload);
            const data = await response.json();

            console.log(`Service ${index + 1} creation response:`, data);
            return data;
          })
        );
      }


      // Success handling
      toast({
        title: "Success",
        description: "Garage and services created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["garages"] });
      form.reset();
      setGarageLogo("");
      setGarageImages([]);
      setServices([{ serviceId: "", price: 0, description: "", featured: false }]);
      setStep(1);

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete the process",
        variant: "destructive",
      });
    }
  };

  const addService = () => {
    setServices([...services, { serviceId: "", price: 0, description: "", featured: false }]);
  };

  const removeService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };

  const updateService = (index: number, field: keyof ServiceForm, value: any) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setServices(updatedServices);
  };

  const handleLogoUpload = (url: string) => {
    setGarageLogo(url);
    form.setValue("logo", url);
  };

  const handleImagesUpload = (urls: string[]) => {
    setGarageImages(urls);
    form.setValue("images", urls);
  };

   // location is likely a string like "24.8607,67.0011"
  const location = form.watch("location");

  let center;
  if (location && typeof location === "string") {
    const [latStr, lngStr] = location.split(",");
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng)) {
      center = { lat, lng };
    }
  }

  return (
    <>
    <div className="p-20">
      {/* Stepper */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center">
          <div className={`flex items-center ${step === 1 ? "text-orange-500" : "text-neutral-700"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-orange-600 text-white" : "bg-neutral-700 text-white"}`}>
              1
            </div>
            <span className="ml-2 font-medium">Garage Details</span>
            <ChevronRight className="mx-2 w-5 h-5" />
          </div>
          
          <div className={`flex items-center ${step === 2 ? "text-orange-500" : "text-neutral-700"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-orange-600 text-white" : "bg-neutral-700 text-white"}`}>
              2
            </div>
            <span className="ml-2 font-medium">Review</span>
          </div>
        </div>
      </div>

      <Form {...form}>
          {/* Step 1: Garage Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Garage Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                 <div className="grid grid-cols-1 gap-4">
                    {/* Is Featured */}
                    <FormField
                      control={form.control as Control<Showroom>}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type of Listing</FormLabel>
                          <Select
                            value={String(field.value)}
                            onValueChange={(value) => field.onChange(value === "true")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Standard</SelectItem>
                              <SelectItem value="false">Featured</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                {/* Name */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (EN)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (AR)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (EN)</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (AR)</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (EN)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="addressAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (AR)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location & Phone */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} value={field.value ?? ""} disabled/>
                            <MapPinIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="h-[300px] w-full rounded border">
                    <GoogleMaps
                      center={{ lat: 24.8607, lng: 67.0011 }}
                      zoom={11}
                      onMapClick={({ lat, lng }) => {
                        form.setValue("location", `${lat},${lng}`);
                      }}
                      markers={
                        form.watch("location")
                          ? [{
                              lat: parseFloat(form.watch("location")!.split(",")[0]),
                              lng: parseFloat(form.watch("location")!.split(",")[1]),
                            }]
                          : []
                      }
                    />

                  </div>

                  </div>
                  <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Timing & Main Branch */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="timing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Hours</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as Control<Showroom>}
                    name="isMainBranch"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is Main Branch</FormLabel>
                        </div>
                      </FormItem>

                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control as Control<Showroom>}
                      name="isMobileService"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Service</FormLabel>
                          <Select
                            value={String(field.value)}
                            onValueChange={(value) => field.onChange(value === "true")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                {/* Logo Upload */}
                <div>
                  <div>
                    {/* Logo uploader */}
                    <Label>Garage Logo</Label>
                    
                    <div className="flex items-center justify-start">
                      <ImageUpload
                        currentImage={garageLogo}
                        onUploadComplete={handleLogoUpload}
                      />
                    </div>
                    <Label>Garage Images</Label>
                    <div className="flex items-center justify-start">
                    {/* Multi-image uploader (max 3 to keep total at 4) */}
                      <MultiImageUpload
                            currentImages={garageImages}
                            onUploadComplete={handleImagesUpload}
                          />
                   
                    </div>
                  </div>
                </div>


              </CardContent>

              <CardHeader>
                <CardTitle>Garage Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    
                    {/* Row 1: Service Description, Price, Is Featured */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Service Description */}
                      <div>
                        <Label>Service {index + 1}</Label>
                        <Input
                          value={service.description}
                          onChange={(e) => updateService(index, "description", e.target.value)}
                          placeholder="Service description"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(index, "price", Number(e.target.value))}
                          placeholder="Enter price"
                        />
                      </div>

                      {/* Is Featured */}
                      <div>
                        <Label className="block mb-1">Feature Service</Label>
                        <div className="flex items-start">
                          <Checkbox
                            id={`featured-${index}`}
                            checked={service.featured}
                            onCheckedChange={(checked) => updateService(index, "featured", checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Category Selection */}
                    <div className="grid grid-cols-2">
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={service.serviceId?.toString() ?? ""}
                          onValueChange={(value) => updateService(index, "serviceId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {carServices.map((carService) => (
                              <SelectItem key={carService.id} value={carService.id.toString()}>
                                {carService.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                      </div>

                      {/* Delete button */}
                    <div className="flex justify-end">
                      {services.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(index)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    </div>
                  </div>
                ))}

                {/* Add Service Button */}
                <div className="flex justify-center">
                  <Button type="button" variant="outline" onClick={addService}>
                    <Plus className="mr-2 h-4 w-4" /> Add Service
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    <ArrowRight className="mr-2 h-4 w-4" /> Next
                  </Button>
                </div>
              </CardContent>

              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 space-y-4">

                  {/* Name */}
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={contact.firstName}
                      onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <Label>Mobile Number</Label>
                    <Input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      placeholder="Enter mobile number"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <Label>WhatsApp</Label>
                    <Input
                      type="tel"
                      value={contact.whatsapp}
                      onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                      placeholder="Enter WhatsApp number"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    <ArrowRight className="mr-2 h-4 w-4" /> Next
                  </Button>
                </div>
              </CardContent>


            </Card>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Garage Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Garage Info Review */}
                <div className="border rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Garage Details</h3>
                  
                  {garageLogo && (
                    <div className="flex justify-center">
                      <img src={garageLogo} alt="Garage Logo" className="h-32 w-32 object-contain" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Name (EN)</Label>
                      <p>{form.watch("name")}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Name (AR)</Label>
                      <p>{form.watch("nameAr")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Address (EN)</Label>
                      <p>{form.watch("address")}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Address (AR)</Label>
                      <p>{form.watch("addressAr")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Phone</Label>
                      <p>{form.watch("phone")}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Working Hours</Label>
                      <p>{form.watch("timing")}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <Label className="text-gray-500">Type of Listing</Label>
                      <p>{form.watch("isFeatured") ? "Featured" : "Standard"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Home Service</Label>
                      <p>{form.watch("isMobileService") ? "Yes" : "No"}</p>
                    </div>
                   
                  </div>
                  <div>
                    <Label className="text-gray-500">Location</Label>
                    <p>{form.watch("location")}</p>
                    <div className="mt-2 h-48">
                      <GoogleMaps
                        center={center}
                        zoom={14}
                      />
                    </div>
                    
                  </div>

                  {garageImages.length > 0 && (
                    <div>
                      <Label className="text-gray-500">Garage Images</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {garageImages.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt={`Garage ${idx + 1}`} 
                            className="h-24 w-full object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Services */}
                {services.length > 0 && (
                  <div className="border rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Services</h3>
                    
                    {services.map((service, index) => {
                      const serviceInfo = carServices.find(s => s.id === service.serviceId);
                      return (
                        <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-gray-500">Service</Label>
                              <p>{serviceInfo?.name || "Not selected"}</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Price</Label>
                              <p>{service.price}</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Featured</Label>
                              <p>{service.featured ? "Yes" : "No"}</p>
                            </div>
                          </div>
                          {service.description && (
                            <div className="mt-2">
                              <Label className="text-gray-500">Description</Label>
                              <p>{service.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Garage Info Review */}
                <div className="border rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Contact Details</h3>
                  

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Phone</Label>
                      <p>{form.watch("phone")}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">WhatsApp</Label>
                      <p>{form.watch("whatsapp")}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create Garage
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
      </Form>
    </div>
    <Footer />
    </>
  );
}

// Define CarService type if not already defined
type CarService = {
  id: string;
  name: string;
};