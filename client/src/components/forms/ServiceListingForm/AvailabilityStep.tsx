import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ServiceStepProps } from "@shared/schema";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

const daysOfWeek = [
  { name: "Monday", key: "mon" },
  { name: "Tuesday", key: "tue" },
  { name: "Wednesday", key: "wed" },
  { name: "Thursday", key: "thu" },
  { name: "Friday", key: "fri" },
  { name: "Saturday", key: "sat" },
  { name: "Sunday", key: "sun" },
];

interface AvailabilityEntry {
  day: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export function AvailabilityStep({
  data,
  updateData,
  nextStep,
  prevStep,
}: ServiceStepProps) {
  const { register, watch, setValue } = useFormContext();

  // Initialize with empty object if undefined
  const availability: Record<string, AvailabilityEntry> = 
    watch("availability") || {};

  // Initialize each day with default values if they don't exist
  useEffect(() => {
    const initialAvailability: Record<string, AvailabilityEntry> = {};
    daysOfWeek.forEach(({ key }) => {
      if (!availability[key]) {
        initialAvailability[key] = {
          day: key,
          isOpen: false,
          startTime: "09:00",
          endTime: "17:00"
        };
      }
    });
    
    if (Object.keys(initialAvailability).length > 0) {
      setValue("availability", {
        ...availability,
        ...initialAvailability
      });
    }
  }, []);

  const handleToggleDay = (day: string) => {
    const current = availability[day] || {
      day,
      isOpen: false,
      startTime: "09:00",
      endTime: "17:00"
    };
    setValue(`availability.${day}`, {
      ...current,
      isOpen: !current.isOpen,
    });
  };

  const handleTimeChange = (
    day: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const current = availability[day] || {
      day,
      isOpen: true,
      startTime: "09:00",
      endTime: "17:00"
    };
    setValue(`availability.${day}`, {
      ...current,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ availability: JSON.stringify(availability) });
    nextStep();
  };

  const setBulkAvailability = (
    days: string[],
    startTime = "09:00",
    endTime = "17:00"
  ) => {
    const newAvailability = { ...availability };
    
    days.forEach((day) => {
      newAvailability[day] = {
        day,
        isOpen: true,
        startTime,
        endTime,
      };
    });

    setValue("availability", newAvailability);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-medium">Weekly Availability</h3>

      <div className="space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setBulkAvailability(["mon", "tue", "wed", "thu", "fri"])
          }
        >
          Open Weekdays
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setBulkAvailability(["sat", "sun"])}
        >
          Open Weekends
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setBulkAvailability([
              "mon",
              "tue",
              "wed",
              "thu",
              "fri",
              "sat",
              "sun",
            ])
          }
        >
          Open All Days
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const resetAvailability: Record<string, AvailabilityEntry> = {};
            daysOfWeek.forEach(({ key }) => {
              resetAvailability[key] = {
                day: key,
                isOpen: false,
                startTime: "09:00",
                endTime: "17:00"
              };
            });
            setValue("availability", resetAvailability);
          }}
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {daysOfWeek.map(({ name, key }) => {
          const dayAvailability = availability[key] || {
            day: key,
            isOpen: false,
            startTime: "09:00",
            endTime: "17:00"
          };
          
          return (
            <div key={key} className="border rounded p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`avail-${key}`}
                  checked={dayAvailability.isOpen}
                  onCheckedChange={() => handleToggleDay(key)}
                />
                <Label htmlFor={`avail-${key}`} className="font-semibold">
                  {name}
                </Label>
              </div>

              {dayAvailability.isOpen && (
                <div className="flex space-x-2">
                  <div>
                    <Label htmlFor={`start-${key}`}>Start</Label>
                    <Input
                      type="time"
                      id={`start-${key}`}
                      value={dayAvailability.startTime}
                      onChange={(e) =>
                        handleTimeChange(key, "startTime", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${key}`}>End</Label>
                    <Input
                      type="time"
                      id={`end-${key}`}
                      value={dayAvailability.endTime}
                      onChange={(e) =>
                        handleTimeChange(key, "endTime", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Next: Pricing</Button>
      </div>
    </form>
  );
}