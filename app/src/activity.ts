export type ActivityDay = { minutes: number; strength: boolean };
export const emptyWeek = (): ActivityDay[] => Array.from({ length: 7 }, () => ({ minutes: 0, strength: false }));
export function validWeek(value: unknown): value is ActivityDay[] {
  return Array.isArray(value) && value.length === 7 && value.every((day) =>
    day && typeof day === "object" && Number.isInteger(day.minutes) && day.minutes >= 0 && day.minutes <= 1440 && typeof day.strength === "boolean");
}
export function mondayLocal(date: Date): string {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
}
