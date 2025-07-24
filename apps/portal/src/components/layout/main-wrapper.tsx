import { cn } from "@ziron/utils";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export const MainWrapper = ({ className, children }: Props) => {
  return (
    <div className={cn("mx-auto max-w-7xl flex-1 pb-6", className)}>
      {children}
    </div>
  );
};
