# Chapter 21 — Locations

> **Part:** VI — Administrator's Guide: People & Organization · **Phase:** 8
> **Covers:** P23, **D04 AddLocationDialog (owner)**, D13 delete-with-undo
> **Roles:** admin

## In this chapter
- Listing every location and reading the **Type** badge
- Creating and editing a location with the **"Add Location"** dialog (D04 — documented here as its owner)
- Deleting a location with the 5-second **Undo** window
- Why the central location cannot be edited or deleted

## Getting here
- **Menu path:** Management ▸ Locations
- **URL:** `/dashboard/locations`
- **Requires:** admin role (route prefix `/dashboard/locations` is admin-only)

<!-- img: ch21-locations-list -->
<!-- img: ch21-add-location-dialog -->
<!-- img: ch21-delete-location-confirm -->

## Walkthrough

1. Open **Locations** in the sidebar — the header shows **"Locations"**, the subtitle *"Manage all locations in the system"*, and an **"Add Location"** button.
2. Read the table; each row is one location (default 10 rows per page — the header shows *"N total records"* and a **Show … per page** selector with 5/10/20/50/100).
3. To add one, click **"Add Location"**, fill the required fields (marked `*`), and click **Save** — the dialog closes and a toast reads *"Location created successfully"*.
4. To edit, click the pencil icon on a regular row — the same dialog opens as **"Edit Location"** pre-filled; click **Update** → *"Location updated successfully"*.
5. To delete, click the trash icon → the **"Delete Location"** confirmation appears → click **Delete**. A toast offers **Undo** for 5 seconds; after that (or if you skip it) the toast becomes *"… deleted successfully"*.

## Forms and fields

**D04 — AddLocationDialog** (component `add-location-dialog.tsx`; opens from `+ Add Location` and from each row's pencil). Same dialog for create and edit; submit calls `POST /api/user/location` (edit: `PUT /api/user/location/{id}`).

| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 1 | `address_line_1` | Address Line 1 * | text | ✓ | placeholder `e.g., 123 Main Street` |
| 2 | `address_line_2` | Address Line 2 | text | — | placeholder `e.g., Suite 100` |
| 3 | `landmark` | Landmark | text | — | placeholder `e.g., Near City Mall` |
| 4 | `city` | City * | text | ✓ | placeholder `e.g., Mumbai` |
| 5 | `pincode` | Pincode * | text | ✓ | placeholder `e.g., 400001` |
| 6 | `state` | State * | text | ✓ | placeholder `e.g., Maharashtra` |
| 7 | `country` | Country * | text | ✓ | prefilled **India**; placeholder `e.g., India` |

- **Validation:** plain HTML `required` — the browser blocks submit until the `*` fields are filled; there are no per-field error messages. Server failures surface as a red banner inside the dialog (message from the API, falling back to *"Failed to save location"*).
- **Titles:** *"Add Location"* / *"Edit Location"*; description *"Create a new location. Click save when you're done."* / *"Update the location details."*
- **Footer buttons:** **Cancel** (closes without saving) and **Save**/**Update** (spinner while submitting).

### D13 — Delete Location confirmation
| Property | Value |
|---|---|
| Title | **Delete Location** |
| Description | *"Are you sure you want to delete this location? This action can be undone within 5 seconds."* |
| Buttons | **Cancel** · **Delete** (destructive) |
| After confirm | dialog closes immediately; the delete is *deferred* — a toast shows the location (`{address_line_1}, {city}`) with an **Undo** button for 5 s. Undo → *"Deletion cancelled"*; timeout → `{name} deleted successfully` |

> **Warning:** the row disappears from the table as soon as you confirm. The 5-second Undo is the only way back — the row is *not* visually restored if you click it.

## Data on this screen

### Locations table (P23 owns these columns)
| Column | Meaning | Source |
|---|---|---|
| `#` | row number on the current page | client-side index |
| Address | pin icon + `address_line_1` (bold) and, when present, `address_line_2` below it | `GET /api/user/location` |
| City | capitalized city | `city` |
| State | capitalized state | `state` |
| Pincode | postal code | `pincode` |
| Country | country name | `country` |
| Type | badge: **Central** (solid) or **Regular** (muted) | `is_central` flag |
| Actions | pencil (edit) + trash (delete) — **empty for the central location** | row rendered only when `!is_central` |

### Central-location protection
Exactly one location is flagged central (`is_central`). Its Type badge reads **Central**, and its Actions cell is empty — no edit, no delete. It is also excluded from the **Assign Location** location picker used on user rosters ([Ch16](ch16-working-with-students.md), [Ch22](ch22-all-users.md)). Treat it as the fixed head-office record.

## Roles & permissions
- **admin** — full CRUD (subject to the central-location rule above).
- **teacher / student** — cannot open this page (403 by route guard).

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| *"No data found."* in the table | no locations exist yet | click **"Add Location"** and create your first one |
| Red banner in the dialog: *"Failed to save location"* (or API message) | submit reached the server but it rejected it (duplicate/validation/network) | correct the highlighted field and resubmit |
| Trash/pencil buttons missing on one row | that row is the **Central** location (by design) | it is protected — regular rows still have both actions |
| Toast *"… will be deleted"* but the row returns after Undo (or a red toast) | you clicked **Undo**, or the delete call failed | the failure toast shows the API error; retry if needed |

## Related
- **Chapters:** [Ch20 — The Admin Dashboard](ch20-admin-dashboard.md) · [Ch22 — All Users](ch22-all-users.md) · [Ch16 — Working with Students](ch16-working-with-students.md) *(D09 picker excludes central locations)*
- **Screens:** P23 · **Dialogs:** D04 *(owner)*, D13
- **Endpoints:** `GET/POST/PUT/DELETE /api/user/location[/{id}]` (details: Appendix C)
