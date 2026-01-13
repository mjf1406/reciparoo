/** @format */

// Day names in order (0 = Sunday, 6 = Saturday)
export const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
] as const;

export const DAY_NAMES_SHORT = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
] as const;

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type MealSlotType = "meal" | "snack";
export type MealPlanDuration = 1 | 2 | 4;

// Bitmask operations
// Each bit represents a day: bit 0 = Sunday, bit 1 = Monday, ..., bit 6 = Saturday

/**
 * Check if a specific day is set in the bitmask
 */
export function isDaySet(bitmask: number, day: DayOfWeek): boolean {
    return (bitmask & (1 << day)) !== 0;
}

/**
 * Set a specific day in the bitmask
 */
export function setDay(bitmask: number, day: DayOfWeek): number {
    return bitmask | (1 << day);
}

/**
 * Unset a specific day in the bitmask
 */
export function unsetDay(bitmask: number, day: DayOfWeek): number {
    return bitmask & ~(1 << day);
}

/**
 * Toggle a specific day in the bitmask
 */
export function toggleDay(bitmask: number, day: DayOfWeek): number {
    return bitmask ^ (1 << day);
}

/**
 * Get all days that are set in the bitmask
 */
export function getSetDays(bitmask: number): DayOfWeek[] {
    const days: DayOfWeek[] = [];
    for (let i = 0; i <= 6; i++) {
        if (isDaySet(bitmask, i as DayOfWeek)) {
            days.push(i as DayOfWeek);
        }
    }
    return days;
}

/**
 * Create a bitmask from an array of days
 */
export function createBitmask(days: DayOfWeek[]): number {
    return days.reduce<number>((mask, day) => setDay(mask, day), 0);
}

/**
 * Get all days set (convenience bitmask for every day)
 */
export const ALL_DAYS_BITMASK = 0b1111111; // 127

/**
 * Get weekdays only bitmask (Monday-Friday)
 */
export const WEEKDAYS_BITMASK = 0b0111110; // 62

/**
 * Get weekend only bitmask (Saturday-Sunday)
 */
export const WEEKEND_BITMASK = 0b1000001; // 65

// Day name conversions

/**
 * Get the full name of a day
 */
export function getDayName(day: DayOfWeek): string {
    return DAY_NAMES[day];
}

/**
 * Get the short name of a day
 */
export function getDayNameShort(day: DayOfWeek): string {
    return DAY_NAMES_SHORT[day];
}

/**
 * Get day names for all set days in a bitmask
 */
export function getDayNamesFromBitmask(bitmask: number): string[] {
    return getSetDays(bitmask).map((day) => getDayName(day));
}

/**
 * Get short day names for all set days in a bitmask
 */
export function getShortDayNamesFromBitmask(bitmask: number): string[] {
    return getSetDays(bitmask).map((day) => getDayNameShort(day));
}

/**
 * Format days as a comma-separated string
 */
export function formatDaysString(bitmask: number, short = false): string {
    const names = short
        ? getShortDayNamesFromBitmask(bitmask)
        : getDayNamesFromBitmask(bitmask);
    return names.join(", ");
}

// Time formatting

/**
 * Parse a time string (24-hour format) into hours and minutes
 */
export function parseTime(time: string): { hours: number; minutes: number } {
    const [hoursStr, minutesStr] = time.split(":");
    return {
        hours: parseInt(hoursStr, 10),
        minutes: parseInt(minutesStr, 10),
    };
}

/**
 * Format hours and minutes into a 24-hour time string
 */
export function formatTime24(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Format a 24-hour time string to 12-hour format for display
 */
export function formatTime12(time: string): string {
    const { hours, minutes } = parseTime(time);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Convert time string to minutes since midnight (for sorting)
 */
export function timeToMinutes(time: string): number {
    const { hours, minutes } = parseTime(time);
    return hours * 60 + minutes;
}

/**
 * Sort meal slots by time
 */
export function sortByTime<T extends { time: string }>(slots: T[]): T[] {
    return [...slots].sort(
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
    );
}

// Date calculations for meal plan weeks

/**
 * Get the dates for a meal plan week starting from a given start day
 */
export function getMealPlanDates(
    startDayOfWeek: DayOfWeek,
    duration: MealPlanDuration,
    referenceDate: Date = new Date()
): Date[] {
    const dates: Date[] = [];
    const totalDays = duration * 7;

    // Find the most recent occurrence of the start day
    const currentDay = referenceDate.getDay() as DayOfWeek;
    let daysToSubtract = currentDay - startDayOfWeek;
    if (daysToSubtract < 0) {
        daysToSubtract += 7;
    }

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
    }

    return dates;
}

/**
 * Get the week number (0-indexed) for a date within a meal plan
 */
export function getWeekNumber(
    date: Date,
    startDayOfWeek: DayOfWeek,
    referenceDate: Date = new Date()
): number {
    const dates = getMealPlanDates(startDayOfWeek, 4, referenceDate);
    const startDate = dates[0];
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

/**
 * Get days ordered starting from a specific day of the week
 */
export function getOrderedDays(startDayOfWeek: DayOfWeek): DayOfWeek[] {
    const days: DayOfWeek[] = [];
    for (let i = 0; i < 7; i++) {
        days.push(((startDayOfWeek + i) % 7) as DayOfWeek);
    }
    return days;
}

// Duration helpers

export const DURATION_OPTIONS: { value: MealPlanDuration; label: string }[] = [
    { value: 1, label: "1 Week" },
    { value: 2, label: "2 Weeks" },
    { value: 4, label: "4 Weeks" },
];

export const START_DAY_OPTIONS: { value: DayOfWeek; label: string }[] =
    DAY_NAMES.map((name, index) => ({
        value: index as DayOfWeek,
        label: name,
    }));
