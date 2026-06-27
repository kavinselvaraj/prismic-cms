import { z } from "zod";

export const flightSearchSchema = z
  .object({
    ADT: z.coerce.number().int().min(1, "At least one adult is required"),
    CHD: z.coerce.number().int().min(0),
    INF: z.coerce.number().int().min(0),
    departureAirport: z.string().min(1, "Departure airport is required"),
    departureDate: z.string().min(1, "Departure date is required"),
    destinationAirport: z.string().min(1, "Destination airport is required"),
    returnDate: z.string().optional(),
    tripType: z.enum(["ONE_WAY", "ROUND_TRIP"]),
  })
  .superRefine((value, context) => {
    if (value.departureAirport === value.destinationAirport) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Departure and destination cannot be same",
        path: ["destinationAirport"],
      });
    }

    if (value.tripType === "ROUND_TRIP" && !value.returnDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Return date is required for round trip",
        path: ["returnDate"],
      });
    }
  });

export const passengerNameSchema = z.object({
  associatedAdultId: z.coerce.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  id: z.coerce.number().int().min(1),
  lastName: z.string().min(1, "Last name is required"),
  type: z.enum(["ADT", "CHD", "INF"]),
});

export const passengerNamesSchema = z
  .object({
    passengers: z.array(passengerNameSchema).min(1),
  })
  .superRefine((value, context) => {
    for (const [index, passenger] of value.passengers.entries()) {
      if (passenger.type === "CHD" && !passenger.associatedAdultId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Child passenger must be associated with an adult",
          path: ["passengers", index, "associatedAdultId"],
        });
      }
    }
  });

export const customerInformationSchema = z.object({
  customers: z.array(
    z.object({
      contactInformation: z.object({
        countryCode: z.string().optional(),
        email: z.string().email("Valid email is required").optional().or(z.literal("")),
        phoneNumber: z.string().optional(),
      }),
      passengerId: z.coerce.number().int().min(1),
      passengerInformation: z.object({
        dateOfBirth: z.string().min(1, "Date of birth is required"),
        firstName: z.string().min(1, "First name is required"),
        gender: z.string().min(1, "Gender is required"),
        lastName: z.string().min(1, "Last name is required"),
        nationality: z.string().min(1, "Nationality is required"),
      }),
      passportInformation: z.object({
        dateOfBirth: z.string().optional(),
        gender: z.string().optional(),
        nationality: z.string().optional(),
        passportExpiryDate: z.string().optional(),
        passportIssuingCountry: z.string().optional(),
        passportNumber: z.string().optional(),
      }),
    }),
  ),
});

export type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;
export type PassengerNamesFormValues = z.infer<typeof passengerNamesSchema>;
export type CustomerInformationFormValues = z.infer<
  typeof customerInformationSchema
>;
