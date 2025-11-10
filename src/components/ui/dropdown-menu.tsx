import React, { useState, useRef, useEffect } from "react";

export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DropdownMenuTrigger) {
          return React.cloneElement(
            child as React.ReactElement<
              React.HTMLAttributes<HTMLButtonElement>
            >,
            { onClick: () => setOpen((o) => !o) }
          );
        }
        return child;
      })}
      {open &&
        React.Children.map(children, (child) => {
          if (
            React.isValidElement(child) &&
            child.type === DropdownMenuContent
          ) {
            return child;
          }
          return null;
        })}
    </div>
  );
};

export const DropdownMenuTrigger: React.FC<
  React.HTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => (
  <button type="button" {...props}>
    {children}
  </button>
);

export const DropdownMenuContent: React.FC<{
  children: React.ReactNode;
  align?: string;
}> = ({ children }) => (
  <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
    {children}
  </div>
);

export const DropdownMenuItem: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ children, ...props }) => (
  <div
    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
    {...props}
  >
    {children}
  </div>
);
