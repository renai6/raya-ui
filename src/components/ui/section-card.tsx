import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  /** Short factual line under the title - a count or a range, not a restatement. */
  description?: ReactNode;
  /** Buttons pinned to the right of the header. */
  actions?: ReactNode;
  /** Filter controls rendered above the content, below the header. */
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * The standard panel for an admin page: heading, optional actions and filters,
 * then content. Every admin card goes through here so elevation, spacing and
 * heading levels stay identical across pages.
 */
const SectionCard = ({
  title,
  description,
  actions,
  toolbar,
  children,
  className,
}: Props) => {
  return (
    <Card className={cn("gap-4 shadow-card", className)}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-base leading-none font-semibold">{title}</h2>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {toolbar}
        {children}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
