import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "group toast bg-popover text-popover-foreground border-border shadow-lg",
        },
      }}
    />
  );
}

export { toast };
