# Route Navigator Plus

https://github.com/krishnasri2007/bus_scheduling-.git


I want you to implement the following features in the EXISTING Route Navigator application.

IMPORTANT — NON-NEGOTIABLE:

DO NOT redesign the existing UI.

DO NOT change the existing visual design.

DO NOT change colors, fonts, spacing, sidebar, cards, tables, page layouts, map styling, or navigation.

DO NOT rebuild the application from scratch.

DO NOT replace the current interactive map.

The current UI is already approved.

Only add the minimum UI elements required to make the following functionality work, and use the SAME existing design system/components.

The features must be REAL and FUNCTIONAL, not static mockups, fake counters, decorative animations, or hardcoded demonstrations.

========================================================

FEATURE 1 — INTERACTIVE ROUTE MAP

========================================================

Keep the current Leaflet + OpenStreetMap map.

The map must use the actual route data from the application's database/API.

Requirements:

- Display routes from the real route dataset.

- Support route search.

- Support route selection.

- Highlight the selected route.

- Show route details.

- Show stops when stop data is available.

- Show depot markers.

- Show buses when a valid simulated position is available.

- Clicking a route should show relevant route information.

- Clicking a depot should show depot information.

- Clicking a bus should show bus information.

Do not create fake route coordinates.

The map must use the same operational state used by scheduling and simulation.

========================================================

FEATURE 2 — FLEET MANAGEMENT

========================================================

Implement fully functional bus management.

The system must support:

- Add Bus

- Edit Bus

- View Bus

- Change Bus Status

- Assign Bus

- Deactivate Bus

- Reactivate Bus

- Retire Bus

Bus fields should include appropriate fields such as:

- bus ID

- bus number

- depot

- capacity

- type

- status

- availability

Use the backend/database as the source of truth.

Bus status should support at least:

AVAILABLE

ASSIGNED

MAINTENANCE

INACTIVE

RETIRED

Rules:

AVAILABLE:

Can be assigned.

ASSIGNED:

Currently assigned to a trip.

MAINTENANCE:

Cannot be assigned.

INACTIVE:

Cannot be assigned.

RETIRED:

Cannot be assigned.

Do not permanently delete operational history simply because a bus is no longer active.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/19156a0e-1a3d-47dc-8db3-4e45d4d04ac9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
