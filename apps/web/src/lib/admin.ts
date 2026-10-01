import { api } from "@/lib/api";
import type {
  Appointment,
  AppointmentStatus,
  AvailabilityWindow,
  BlockedSlot,
  Client,
} from "@/types/database";

export async function fetchAdminStats() {
  return api<{
    upcoming: number;
    pending: number;
    appointmentsMonth: number;
    clientsTotal: number;
    messagesUnread: number;
    appointmentsTotal: number;
  }>("/api/admin/stats");
}

export async function fetchAppointments(opts?: {
  from?: string;
  to?: string;
  status?: AppointmentStatus[];
}) {
  const params = new URLSearchParams();
  if (opts?.from) params.set("from", opts.from);
  if (opts?.to) params.set("to", opts.to);
  opts?.status?.forEach((status) => params.append("status[]", status));
  const query = params.toString();
  return api<Appointment[]>(`/api/admin/appointments${query ? `?${query}` : ""}`);
}

export async function fetchTodayAppointments() {
  const { brusselsDayBoundsIso } = await import("@/lib/datetime");
  const { from, to } = brusselsDayBoundsIso();
  return fetchAppointments({
    from,
    to,
    status: ["pending", "confirmed"],
  });
}

export async function updateAppointment(
  id: string,
  patch: Partial<{
    status: AppointmentStatus;
    starts_at: string;
    ends_at: string;
    duration: number;
    subject: string;
    description: string;
    type: Appointment["type"];
  }>,
) {
  return api<Appointment>(`/api/admin/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteAppointment(id: string) {
  await api(`/api/admin/appointments/${id}`, { method: "DELETE" });
}

export async function fetchClients() {
  return api<Client[]>("/api/admin/clients");
}

export async function deleteClient(id: string) {
  await api(`/api/admin/clients/${id}`, { method: "DELETE" });
}

export async function fetchAvailabilityWindows() {
  return api<AvailabilityWindow[]>("/api/admin/windows");
}

export async function createAvailabilityWindow(input: {
  day_of_week: number;
  start_time: string;
  end_time: string;
}) {
  return api<AvailabilityWindow>("/api/admin/windows", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAvailabilityWindow(
  id: string,
  input: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active?: boolean;
  },
) {
  return api<AvailabilityWindow>(`/api/admin/windows/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAvailabilityWindow(id: string) {
  await api(`/api/admin/windows/${id}`, { method: "DELETE" });
}

export async function fetchBlockedSlots(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return api<BlockedSlot[]>(`/api/admin/blocked${query ? `?${query}` : ""}`);
}

export async function createBlockedSlot(input: {
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
}) {
  return api<BlockedSlot>("/api/admin/blocked", {
    method: "POST",
    body: JSON.stringify({
      date: input.date,
      start_time: input.start_time ?? null,
      end_time: input.end_time ?? null,
      reason: input.reason ?? null,
    }),
  });
}

export async function deleteBlockedSlot(id: string) {
  await api(`/api/admin/blocked/${id}`, { method: "DELETE" });
}

export async function updateAllowedDurations(durations: number[]) {
  return api("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({ allowed_durations: durations }),
  });
}

export type StaffUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  phone: string | null;
  created_at: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  question_en: string | null;
  answer_en: string | null;
  sort_order: number;
  published: boolean;
};

export type ArticleItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  category_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  category?: { id: string; name: string; slug: string } | null;
};

export type CategoryItem = { id: string; name: string; slug: string };

export function fetchStaffUsers() {
  return api<StaffUser[]>("/api/admin/users");
}

export function saveStaffUser(
  input: {
    name: string;
    email: string;
    role: "admin" | "super_admin";
    phone?: string | null;
    password?: string;
  },
  id?: number,
) {
  return api<StaffUser>(id ? `/api/admin/users/${id}` : "/api/admin/users", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(input),
  });
}

export function deleteStaffUser(id: number) {
  return api(`/api/admin/users/${id}`, { method: "DELETE" });
}

export function fetchAdminFaqs() {
  return api<FaqItem[]>("/api/admin/faqs");
}

export function saveFaq(input: Omit<FaqItem, "id">, id?: string) {
  return api<FaqItem>(id ? `/api/admin/faqs/${id}` : "/api/admin/faqs", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(input),
  });
}

export function deleteFaq(id: string) {
  return api(`/api/admin/faqs/${id}`, { method: "DELETE" });
}

export function fetchAdminArticles() {
  return api<ArticleItem[]>("/api/admin/articles");
}

export function saveArticle(
  input: {
    title: string;
    excerpt: string;
    content: string;
    published: boolean;
    category_id?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    slug?: string;
  },
  id?: string,
) {
  return api<ArticleItem>(
    id ? `/api/admin/articles/${id}` : "/api/admin/articles",
    {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(input),
    },
  );
}

export function deleteArticle(id: string) {
  return api(`/api/admin/articles/${id}`, { method: "DELETE" });
}

export function fetchAdminCategories() {
  return api<CategoryItem[]>("/api/admin/categories");
}

export function createCategory(name: string) {
  return api<CategoryItem>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(id: string) {
  return api(`/api/admin/categories/${id}`, { method: "DELETE" });
}
