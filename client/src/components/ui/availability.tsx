import { useEffect, useState } from "react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { AvailabilityEntry } from "@shared/schema";
import { DialogClose } from "@/components/ui/dialog";

type AvailabilityEditorProps = {
  availability?: Record<string, AvailabilityEntry>;
  onChange: (availability: Record<string, AvailabilityEntry>) => void;
};

const daysOfWeek = [
  { key: "mon", name: "Monday" },
  { key: "tue", name: "Tuesday" },
  { key: "wed", name: "Wednesday" },
  { key: "thu", name: "Thursday" },
  { key: "fri", name: "Friday" },
  { key: "sat", name: "Saturday" },
  { key: "sun", name: "Sunday" },
];

export const AvailabilityEditor: React.FC<AvailabilityEditorProps> = ({
  availability = {},
  onChange,
}) => {
  const [localAvailability, setLocalAvailability] = useState(availability);

  useEffect(() => {
    const filled: Record<string, AvailabilityEntry> = {};
    daysOfWeek.forEach(({ key }) => {
      if (!localAvailability[key]) {
        filled[key] = {
          day: key,
          isOpen: false,
          startTime: "09:00",
          endTime: "17:00",
        };
      }
    });

    if (Object.keys(filled).length > 0) {
      setLocalAvailability((prev) => ({ ...prev, ...filled }));
    }
  }, []);

  const updateDay = (day: string, data: Partial<AvailabilityEntry>) => {
    setLocalAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...data },
    }));
  };

  const setBulkAvailability = (
    days: string[],
    isOpen: boolean,
    start = "09:00",
    end = "17:00"
  ) => {
    const updated = { ...localAvailability };
    days.forEach((day) => {
      updated[day] = { day, isOpen, startTime: start, endTime: end };
    });
    setLocalAvailability(updated);
  };

  return (
    <div className="space-y-4">
      {/* Bulk Buttons */}
      <div className="space-x-2">
        <Button
          variant="outline"
          className="border-orange-500 text-orange-500"
          onClick={() =>
            setBulkAvailability(["mon", "tue", "wed", "thu", "fri"], true)
          }
        >
          Open Weekdays
        </Button>

        <Button
          variant="outline"
          className="border-orange-500 text-orange-500"
          onClick={() => setBulkAvailability(["sat", "sun"], true)}
        >
          Open Weekends
        </Button>

        <Button
          variant="outline"
          className="border-orange-500 text-orange-500"
          onClick={() =>
            setBulkAvailability(
              ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
              true
            )
          }
        >
          Open All Days
        </Button>

        <Button
          variant="outline"
          className="border-orange-500 text-orange-500"
          onClick={() => {
            const reset = daysOfWeek.reduce((acc, { key }) => {
              acc[key] = {
                day: key,
                isOpen: false,
                startTime: "09:00",
                endTime: "17:00",
              };
              return acc;
            }, {} as Record<string, AvailabilityEntry>);
            setLocalAvailability(reset);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Daily Availability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {daysOfWeek.map(({ name, key }) => {
          const entry = localAvailability[key];
          return (
            <div key={key} className="border rounded p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`avail-${key}`}
                  checked={entry?.isOpen || false}
                  onCheckedChange={(checked) =>
                    updateDay(key, { isOpen: Boolean(checked) })
                  }
                  className="data-[state=checked]:bg-blue-900 data-[state=checked]:border-blue-900"
                />

                <Label
                  htmlFor={`avail-${key}`}
                  className={`font-semibold ${
                    entry?.isOpen ? "text-blue-900" : "text-black"
                  }`}
                >
                  {" "}
                  {name}
                </Label>
              </div>

              {entry?.isOpen && (
                <div className="flex space-x-2">
                  <div>
                    <Label htmlFor={`start-${key}`}>Start</Label>
                    <Input
                      type="time"
                      id={`start-${key}`}
                      value={entry.startTime}
                      onChange={(e) =>
                        updateDay(key, { startTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${key}`}>End</Label>
                    <Input
                      type="time"
                      id={`end-${key}`}
                      value={entry.endTime}
                      onChange={(e) =>
                        updateDay(key, { endTime: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <DialogClose asChild>
          <Button
            variant="outline"
            onClick={() => {
              setLocalAvailability(availability);
            }}
          >
            Cancel
          </Button>
        </DialogClose>

        <DialogClose asChild>
          <Button
            className="bg-orange-500"
            onClick={() => onChange(localAvailability)}
          >
            Save Availability
          </Button>
        </DialogClose>
      </div>
    </div>
  );
};
