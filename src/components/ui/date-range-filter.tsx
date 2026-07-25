import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

type Props = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
};

const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: Props) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const hasRange = Boolean(startDate || endDate);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-44 justify-between font-normal"
            aria-label="Filter from date"
          >
            {startDate ? startDate.toLocaleDateString() : "From"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            captionLayout="dropdown"
            onSelect={(date) => {
              onStartDateChange(date);
              setIsStartOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-44 justify-between font-normal"
            aria-label="Filter to date"
          >
            {endDate ? endDate.toLocaleDateString() : "To"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            captionLayout="dropdown"
            disabled={(date) => (startDate ? date < startDate : false)}
            onSelect={(date) => {
              onEndDateChange(date);
              setIsEndOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        disabled={!hasRange}
        onClick={() => {
          onStartDateChange(undefined);
          onEndDateChange(undefined);
        }}
      >
        Clear
      </Button>
    </div>
  );
};

export default DateRangeFilter;
