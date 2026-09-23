# Chapter 22 — All Users

> **Part:** VI — Administrator's Guide: People & Organization · **Phase:** 8
> **Covers:** P16, D09 AssignLocationDialog *(cross-reference only — owner is [Ch16](ch16-working-with-students.md))*
> **Roles:** admin

## In this chapter
- Listing every account in the system regardless of role
- Reading the role badges and location column
- Assigning, changing, or removing a user's location from the roster

## Getting here
- **Menu path:** Management ▸ Users ▸ All Users
- **URL:** `/dashboard/users`
- **Requires:** admin role (the whole `/dashboard/users` subtree is admin-only)

<!-- img: ch22-all-users -->

## Walkthrough

1. Open **All Users** in the sidebar — the header reads **"All Users"** with the subtitle *"Manage all users in the system"*.
2. Scan the table: every account (student, teacher, admin) appears, paginated at 10 rows per page (*"N total records"*, **Show … per page** selector).
3. To set a location for a user, click the pin icon in the **Actions** column — the **"Assign Location"** dialog opens for that person.
4. Pick a location from the select, then click **Assign** — the dialog closes and a toast reads *"Location assigned successfully"*.
5. To clear a location, open the same dialog and click the **✕** on the current-location card — the toast reads *"Location removed successfully"*.

> **Note:** your own row has an empty **Actions** cell — you cannot assign a location to yourself from this table.

## Data on this screen

### Users table (P16 owns these columns)
| Column | Meaning | Source |
|---|---|---|
| `#` | row number on the current page | client-side index |
| Name | avatar (initials on a colored tile) + `First Last` — **plain text, not a link** | `GET /api/user` → `fname`/`lname` |
| Email | email address | `email` |
| Role | badge: blue **Student**, green **Teacher**, purple **Admin** | `role` |
| Mobile | mobile number | `mobileNumber` |
| Location | pin icon + `City, State` — or muted **"Not assigned"** | `user.location` |
| Actions | pin icon button, tooltip *"Assign location"*; empty for your own row | rendered only when `user.id !== current user` |

> **Tip:** this roster never links to student profiles — the **Name** column is plain text here. Open a student's profile from the **Students** roster ([Ch24](ch24-students.md)).

### The Assign Location dialog (D09 — owned by Ch16)
Documented in full in [Ch16 — Working with Students](ch16-working-with-students.md); summary for this screen:

| Property | Value |
|---|---|
| Title / description | **Assign Location** / *"Assign a location to {First Last}"* |
| Current location card | address + `City, State` with a ✕ button to remove it (no confirmation step) |
| Label | **"Select Location"** when none set, **"Change Location"** when one is set |
| Select options | all **non-central** locations (`{address}, {City}, {State}`); shows *"Loading locations..."* while loading |
| Buttons | **Cancel** · **Assign** (disabled until a location is chosen; spinner while saving) |
| Submit | `PATCH /api/user/{id}/location` with the chosen id, or `null` when removing |
| Success | *"Location assigned successfully"* / *"Location removed successfully"* |
| Failure | red banner in the dialog — *"Failed to assign location"* / *"Failed to remove location"* (or the API message) |

The central location never appears in the picker (see [Ch21](ch21-locations.md)).

## Roles & permissions
- **admin** — only role that can open `/dashboard/users`; assign/change/remove locations.
- **teacher / student** — route not permitted (403).
- The location you assign here is what location-scoped reporting and the **Users by Location** widget ([Ch20](ch20-admin-dashboard.md)) count.

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| *"Not assigned"* in the Location column | that user has no location yet | open D09 from the row's pin button and assign one |
| Empty **Actions** cell on your own row | by design — you cannot relocate yourself | ask another admin |
| Banner *"Failed to assign location"* | the PATCH call was rejected (network/permissions) | retry; check backend log if it persists |
| **Assign** button stays disabled | no option selected in the picker | choose a location first |
| *"No data found."* | the user table is empty (fresh install) | create accounts via sign-up ([Ch5](ch05-getting-started.md)) |

## Related
- **Chapters:** [Ch16 — Working with Students](ch16-working-with-students.md) *(D09 owner)* · [Ch20 — The Admin Dashboard](ch20-admin-dashboard.md) · [Ch21 — Locations](ch21-locations.md) · [Ch23 — Teachers](ch23-teachers.md) · [Ch24 — Students](ch24-students.md)
- **Screens:** P16 · **Dialogs:** D09 *(cross-ref)*
- **Endpoints:** `GET /api/user`, `PATCH /api/user/{id}/location` (details: Appendix C)
