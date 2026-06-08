import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  const n = Number(price)
  return `${(Number.isFinite(n) ? n : 0).toLocaleString("en-US")} ₪`
}
