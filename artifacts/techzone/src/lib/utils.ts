import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ar-SA")} ₪`
}

export function pluralize(n: number, singular: string, plural: string): string {
  if (n === 0) return `0 ${plural}`
  if (n === 1) return `1 ${singular}`
  if (n === 2) return `${singular}ان`
  if (n >= 3 && n <= 10) return `${n} ${plural}`
  return `${n} ${singular}`
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + "..."
}

