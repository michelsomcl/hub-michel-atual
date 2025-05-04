
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return uuidv4();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatPhoneNumber(phone: string): string {
  // Format phone number as (XX) XXXXX-XXXX
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    // Format as (XX) XXXXX-XXXX
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    // Format as (XX) XXXX-XXXX
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  
  // Return original if format doesn't match expected patterns
  return phone;
}
