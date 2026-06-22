import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Ghép className có điều kiện + tự merge Tailwind class trùng. */
export const cn = (...inputs) => twMerge(clsx(inputs));
