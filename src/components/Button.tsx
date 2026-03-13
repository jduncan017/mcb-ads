"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { type RoundedSize, roundedClasses } from "./shared-styles";
import {
  type ButtonVariant,
  type ButtonSize,
  buttonBase,
  buttonFocus,
  variantClasses,
  sizeClasses,
  arrowSizeClasses,
  spinnerClasses,
} from "./button-styles";
import {
  usePersistedQueryString,
  appendQueryString,
} from "~/components/QueryParamProvider";

type BaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: RoundedSize;
  loading?: boolean;
  disabled?: boolean;
  arrow?: boolean;
  className?: string;
};

type ButtonElementProps = BaseProps & {
  as?: "button";
  type?: "button" | "submit" | "reset";
  href?: never;
} & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof BaseProps | "type"
  >;

type AnchorElementProps = BaseProps & {
  as: "a";
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>;

type LinkElementProps = BaseProps & {
  as: "link";
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>;

type ButtonProps = ButtonElementProps | AnchorElementProps | LinkElementProps;

function Spinner() {
  return <Loader2 className={spinnerClasses} aria-hidden="true" />;
}

export function Button(props: ButtonProps) {
  const {
    children,
    as = "button",
    variant = "primary",
    size: rawSize,
    rounded: rawRounded,
    loading = false,
    disabled = false,
    arrow = false,
    className = "shadow-theme",
    ...rest
  } = props;
  const qs = usePersistedQueryString();
  const size: ButtonSize = rawSize ?? "md";
  const rounded: RoundedSize = rawRounded ?? "xl";
  const classes = [
    buttonBase,
    buttonFocus,
    variantClasses[variant],
    arrow ? arrowSizeClasses[size] : sizeClasses[size],
    roundedClasses[rounded],
    loading ? "pointer-events-none opacity-75" : "",
    arrow ? "group" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && <Spinner />}
      {children}
      {arrow && (
        <span
          className={`ml-4 hidden shrink-0 items-center justify-center rounded-full bg-white p-2 md:flex`}
        >
          <ArrowUpRight
            className="h-6 w-6 text-neutral-400 transition-transform duration-300 group-hover:rotate-45"
            strokeWidth={2.5}
          />
        </span>
      )}
    </>
  );

  if (as === "button") {
    const { type = "button", ...buttonRest } = rest as Omit<
      ButtonElementProps,
      keyof BaseProps
    >;
    return (
      <button
        type={type}
        disabled={disabled || loading}
        className={`${classes} disabled:cursor-not-allowed disabled:opacity-50`}
        aria-busy={loading || undefined}
        {...buttonRest}
      >
        {content}
      </button>
    );
  }

  const linkDisabledClasses =
    disabled || loading ? "pointer-events-none opacity-50" : "";
  const linkProps = {
    className: `${classes} ${linkDisabledClasses}`,
    "aria-disabled": disabled || loading || undefined,
    "aria-busy": loading || undefined,
    tabIndex: disabled || loading ? -1 : undefined,
  };

  if (as === "link") {
    const { href, ...linkRest } = rest as Omit<
      LinkElementProps,
      keyof BaseProps
    >;
    return (
      <Link href={appendQueryString(href, qs)} {...linkProps} {...linkRest}>
        {content}
      </Link>
    );
  }

  // as === "a"
  const { href, ...anchorRest } = rest as Omit<
    AnchorElementProps,
    keyof BaseProps
  >;
  return (
    <a href={href} {...linkProps} {...anchorRest}>
      {content}
    </a>
  );
}
