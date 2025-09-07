/**
 * Trip Event Domain Schema
 *
 * Models VEVENT-like events including events with no start date.
 * Uses discriminated union for explicit rules that AI agents can reason about.
 */
import { z } from 'zod';
declare const UnscheduledEventSchema: z.ZodObject<{
    id: z.ZodString;
    tripId: z.ZodString;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    kind: z.ZodLiteral<"unscheduled">;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
}>;
declare const AllDayEventSchema: z.ZodObject<{
    id: z.ZodString;
    tripId: z.ZodString;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    kind: z.ZodLiteral<"allDay">;
    startDate: z.ZodDate;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
}>;
declare const TimedEventSchema: z.ZodObject<{
    id: z.ZodString;
    tripId: z.ZodString;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    kind: z.ZodLiteral<"timed">;
    startDateTime: z.ZodDate;
    endDateTime: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}>;
export declare const TripEventSchema: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
    id: z.ZodString;
    tripId: z.ZodString;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    kind: z.ZodLiteral<"unscheduled">;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    tripId: z.ZodString;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    kind: z.ZodLiteral<"allDay">;
    startDate: z.ZodDate;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    tripId: z.ZodString;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    kind: z.ZodLiteral<"timed">;
    startDateTime: z.ZodDate;
    endDateTime: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}>]>;
export type TripEvent = z.infer<typeof TripEventSchema>;
export type UnscheduledEvent = z.infer<typeof UnscheduledEventSchema>;
export type AllDayEvent = z.infer<typeof AllDayEventSchema>;
export type TimedEvent = z.infer<typeof TimedEventSchema>;
export type EventKind = TripEvent['kind'];
export { UnscheduledEventSchema, AllDayEventSchema, TimedEventSchema };
export declare const TripEventRefinedSchema: z.ZodEffects<z.ZodEffects<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
    id: z.ZodString;
    tripId: z.ZodString;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    kind: z.ZodLiteral<"unscheduled">;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    tripId: z.ZodString;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    kind: z.ZodLiteral<"allDay">;
    startDate: z.ZodDate;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    tripId: z.ZodString;
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    kind: z.ZodLiteral<"timed">;
    startDateTime: z.ZodDate;
    endDateTime: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}>]>, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
} | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
} | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
} | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
} | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}>, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
} | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
} | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "unscheduled";
    notes?: string | undefined;
} | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "allDay";
    startDate: Date;
    notes?: string | undefined;
    endDate?: Date | undefined;
} | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tripId: string;
    title: string;
    kind: "timed";
    startDateTime: Date;
    endDateTime: Date;
    notes?: string | undefined;
}>;
export type TripEventRefined = z.infer<typeof TripEventRefinedSchema>;
