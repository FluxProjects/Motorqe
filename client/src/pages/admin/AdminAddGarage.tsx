import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Define your schema
const garageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  address: z.string().optional(),
  addressAr: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  timing: z.string().optional(),
  isMainBranch: z.boolean().default(false),
  logo: z.string().optional(),
  images: z.array(z.string()).optional(),
  userId: z.string().optional(),
  isGarage: z.boolean().default(true),
});

type GarageFormValues = z.infer<typeof garageSchema>;

type ServiceForm = {
  serviceId: string;
  price: number;
  description: string;
  featured: boolean;
};

export default function AdminAddGarage() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [garageLogo, setGarageLogo] = useState<string>("");
  const [garageImages, setGarageImages] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceForm[]>([
    { serviceId: "", price: 0, description: "", featured: false }
  ]);

  // Fetch car services for dropdown
  const { data: carServices = [] } = useQuery<CarService[]>({
    queryKey: ["car-services"],
    queryFn: () => apiRequest("GET", "/api/services").then(res => res.json()),
  });

  const form = useForm<GarageFormValues>({
    resolver: zodResolver(garageSchema),
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
      userId: "",
      isGarage: true,
    },
  });

  // Create garage mutation
  const createGarageMutation = useMutation({
    mutationFn: async (data: GarageFormValues) => {
      const garageResponse = await apiRequest("POST", "/api/garages", {
        ...data,
        logo: garageLogo,
        images: garageImages,
      });
      const garage = await garageResponse.json();
      
      if (services.length > 0) {
        await Promise.all(
          services.map(service => 
            apiRequest("POST", "/api/garage-services", {
              garageId: garage.id,
              serviceId: service.serviceId,
              price: service.price,
              description: service.description,
              featured: service.featured,
              status: "active"
            })
          )
        );
      }
      
      return garage;
    },
    onSuccess: () => {
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
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create garage",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GarageFormValues) => {
    createGarageMutation.mutate({
      ...data,
      logo: garageLogo,
      images: garageImages,
      isGarage: true,
    });
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Stepper */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step === 1 ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              1
            </div>
            <span className="ml-2 font-medium">Garage Details</span>
            <ChevronRight className="mx-2 w-5 h-5" />
          </div>
          
          <div className={`flex items-center ${step === 2 ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              2
            </div>
            <span className="ml-2 font-medium">Services</span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
          {/* Step 1: Garage Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Garage Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                

                {/* Name */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control as Control<GarageFormValues>}
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
                    control={form.control as Control<GarageFormValues>}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (AR)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as Control<GarageFormValues>}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (EN)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as Control<GarageFormValues>}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (AR)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as Control<GarageFormValues>}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (EN)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as Control<GarageFormValues>}
                    name="addressAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (AR)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location & Phone */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control as Control<GarageFormValues>}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} />
                            <MapPinIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control as Control<GarageFormValues>}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Timing & Main Branch */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as Control<GarageFormValues>}
                    name="timing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Hours</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as Control<GarageFormValues>}
                    name="isMainBranch"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
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

                {/* Logo Upload */}
                <div>
                  <Label>Garage Logo & Images</Label>
                  <div className="flex items-start">
                    <ImageUpload
                      currentImage={garageLogo}
                      onUploadComplete={handleLogoUpload}
                    />
                    <MultiImageUpload
                      currentImages={garageImages}
                      onUploadComplete={handleImagesUpload}
                    />
                  </div>

                </div>

              </CardContent>

              <CardHeader>
                <CardTitle>Garage Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Service {index + 1}</h3>
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

                    <div className="grid grid-cols-2 gap-4">
                      {/* Service Selection */}
                      <div>
                        <Label>Service</Label>
                        <Select
                          value={service.serviceId}
                          onValueChange={(value) => updateService(index, 'serviceId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {carServices.map((carService) => (
                              <SelectItem key={carService.id} value={carService.id}>
                                {carService.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price */}
                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(index, 'price', Number(e.target.value))}
                          placeholder="Enter price"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        placeholder="Service description"
                        rows={3}
                      />
                    </div>

                    {/* Featured */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`featured-${index}`}
                        checked={service.featured}
                        onCheckedChange={(checked) => updateService(index, 'featured', checked)}
                      />
                      <Label htmlFor={`featured-${index}`}>Featured Service</Label>
                    </div>
                  </div>
                ))}

                {/* Add Service Button */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addService}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Service
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Next
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={createGarageMutation.isPending}
                  >
                    {createGarageMutation.isPending ? "Creating..." : "Create Garage"}
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

                {/* Services Review */}
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
                    className="bg-green-600 hover:bg-green-700"
                    disabled={createGarageMutation.isPending}
                  >
                    {createGarageMutation.isPending ? "Creating..." : "Create Garage"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}

// Define CarService type if not already defined
type CarService = {
  id: string;
  name: string;
};