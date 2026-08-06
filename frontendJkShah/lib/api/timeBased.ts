import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import { StartTestResponse } from "./types";

export interface StartTimeBasedPayload {
  duration_minutes: number;
  selections: {
    course_id: string;
    subject_id?: string;
    topic_id?: string;
  }[];
}

export const timeBasedTestsApi = {
  start: (payload: StartTimeBasedPayload, token?: string) =>
    apiRequest<StartTestResponse>(API_ROUTES.TIME_BASED.START, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
};
