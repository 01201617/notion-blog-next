import React from "react";
import clsx from "clsx";
//https://zenn.dev/takasy/articles/react-tags-input

const variants = {
  primary: "bg-green-500 text-white",
  inverse: "bg-white text-gray-600 border",
  danger: "bg-red-500 text-white",
};

const sizes = {
  sm: "py-1 px-1 text-sm",
  md: "py-1 px-2 text-md",
  lg: "py-2 px-3 text-lg",
};

type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  color: string;
  size?: keyof typeof sizes;
  onClose?: () => void;
};

export const Badge: React.FC<BadgeProps> = ({
  color = "868686",
  size = "md",
  onClose,
  className,
  ...props
}) => {
  function getContrastYIQ(hexColor: string) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "grey" : "white";
  }

  return (
    <span
      className={clsx(
        "font-medium rounded inline-flex items-center",
        className
      )}
      style={{
        backgroundColor: color + "90",
        color: getContrastYIQ(color),
      }}
    >
      <span className={clsx(sizes[size])}>{props.children}</span>
      {onClose && (
        <span
          className={clsx(
            "inline-flex items-center border-l h-full w-hull cursor-pointer",
            sizes[size]
          )}
          onClick={() => onClose && onClose()}
        >
          x
        </span>
      )}
    </span>
  );
};
