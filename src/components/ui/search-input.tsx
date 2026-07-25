import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  value?: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
};

const SearchInput = ({ value, placeholder, onChange, className }: Props) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
