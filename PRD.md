# Planning Guide

A personnel management database for tracking characters and NPCs in a Star Wars Sith Empire military roleplay community, designed to feel like an authentic in-universe Imperial terminal system.

**Experience Qualities**:
1. **Authoritative** - The interface should evoke the rigid, militaristic hierarchy of the Sith Empire with precise data organization and commanding visual presence
2. **Immersive** - Every element should reinforce the Star Wars universe aesthetic, making users feel they're accessing an actual Imperial database terminal
3. **Efficient** - Quick access to roster information with clear visual hierarchy for rapid personnel review and updates

**Complexity Level**: Light Application (multiple features with basic state)
This is a CRUD application focused on managing a roster list with form-based editing. The scope is intentionally constrained to support an existing homebrew system without overengineering features.

## Essential Features

**View Roster List**
- Functionality: Display all characters/NPCs in a scannable list format with key information visible
- Purpose: Provides quick overview of all personnel in the unit
- Trigger: Default view on application load
- Progression: App loads → Roster list displays → User scans personnel entries
- Success criteria: All saved characters display with name, rank, and role clearly visible

**Add New Personnel**
- Functionality: Create new character/NPC entry with essential fields
- Purpose: Expand the roster with new personnel records
- Trigger: User clicks "Add Personnel" button
- Progression: Click add button → Form dialog opens → Fill fields → Save → New entry appears in roster
- Success criteria: New personnel entry persists and displays correctly in the roster list

**Edit Personnel**
- Functionality: Modify existing character/NPC information
- Purpose: Keep roster records current as characters develop or details change
- Trigger: User clicks edit action on a roster entry
- Progression: Click edit → Form pre-fills with existing data → Modify fields → Save → Updated entry reflects changes
- Success criteria: Changes persist and display immediately in the roster

**Delete Personnel**
- Functionality: Remove character/NPC from roster
- Purpose: Clean up retired characters or incorrect entries
- Trigger: User clicks delete action on a roster entry
- Progression: Click delete → Confirmation prompt → Confirm → Entry removed from roster
- Success criteria: Deleted entry no longer appears and does not return on refresh

**Personnel Details View**
- Functionality: Expand entry to see full character information
- Purpose: Review complete personnel file without cluttering the list view
- Trigger: User clicks on a roster entry
- Progression: Click entry → Detailed view displays → User reviews information → Close or edit
- Success criteria: All stored information is readable and well-organized

## Edge Case Handling

- **Empty Roster State**: Display an Imperial-themed empty state message encouraging the user to add their first personnel record
- **Long Names/Text**: Truncate with ellipsis in list view, show full text in detail/edit views
- **Duplicate Names**: Allow duplicates (common in military settings) but ensure each has unique identifier
- **Required Fields**: Prevent saving if essential fields (name) are empty with clear validation messaging

## Design Direction

The design should evoke the cold, calculated aesthetic of Sith Empire technology - sleek black surfaces with crimson red accents, sharp geometric forms, and a sense of oppressive authority. Think Imperial terminal interfaces: high-contrast displays with data presented in precise, militaristic formatting. The interface should feel technical and utilitarian while maintaining a distinctly dark side aesthetic.

## Color Selection

A dark, authoritative palette centered on deep blacks and Imperial crimson, evoking Sith Empire technology and the dark side.

- **Primary Color**: Deep crimson red (oklch(0.45 0.22 25)) - The signature color of the Sith, used for primary actions and important UI elements, communicating power and authority
- **Secondary Colors**: Dark charcoal backgrounds (oklch(0.15 0.01 25)) with slightly lighter panels (oklch(0.2 0.01 25)) to create subtle depth and hierarchy
- **Accent Color**: Bright Imperial red (oklch(0.55 0.25 25)) - High-visibility crimson for critical actions, active states, and attention-drawing elements
- **Foreground/Background Pairings**:
  - Background (oklch(0.12 0.01 25)): Light gray text (oklch(0.85 0.01 25)) - Ratio 10.2:1 ✓
  - Card/Panel (oklch(0.18 0.01 25)): Light gray text (oklch(0.85 0.01 25)) - Ratio 7.8:1 ✓
  - Primary Red (oklch(0.45 0.22 25)): White text (oklch(0.98 0 0)) - Ratio 5.1:1 ✓
  - Accent Red (oklch(0.55 0.25 25)): White text (oklch(0.98 0 0)) - Ratio 6.8:1 ✓

## Font Selection

Typefaces should convey technical precision and military efficiency, with a monospace aesthetic for data fields to reinforce the terminal interface feeling while maintaining readability for longer text.

- **Typographic Hierarchy**:
  - H1 (Section Headers): JetBrains Mono Bold / 24px / tracking-wide / uppercase
  - H2 (Personnel Names): JetBrains Mono SemiBold / 18px / tracking-normal
  - Body (Labels & Data): JetBrains Mono Regular / 14px / tracking-normal
  - Small (Meta info): JetBrains Mono Regular / 12px / tracking-wide / text-muted-foreground

## Animations

Animations should feel technical and precise, like interface elements snapping into place on a military terminal. Use sharp, quick transitions (150-200ms) for state changes, subtle red glow effects on hover for interactive elements, and smooth but efficient sliding motions for dialogs/drawers. Avoid organic or bouncy animations - everything should feel mechanical and controlled, reinforcing the authoritarian Imperial aesthetic.

## Component Selection

- **Components**:
  - Card: Container for each personnel entry in the list, modified with dark background and subtle red border on hover
  - Dialog: For add/edit personnel forms, styled as Imperial terminal windows with red accent borders
  - Button: Primary actions in crimson, secondary in muted gray, all with sharp edges (reduced border radius)
  - Input/Textarea: Dark backgrounds with red focus rings, monospace font for technical feel
  - Badge: Display ranks and roles with appropriate color coding
  - ScrollArea: For long roster lists, with custom scrollbar styled in red
  - Separator: Thin red lines to divide sections within personnel details
  - AlertDialog: For delete confirmations, warning-styled with Imperial messaging

- **Customizations**:
  - Reduce global border radius for sharper, more angular Imperial aesthetic
  - Custom grid layout for personnel cards with consistent spacing
  - Imperial insignia or decorative corner elements on cards/dialogs
  - Custom red glow effect on interactive elements using box-shadow

- **States**:
  - Buttons: Default dark with red text, hover with red background and white text, active with deeper red
  - Cards: Default dark, hover with subtle red border glow, selected/expanded with full red border
  - Inputs: Default with dark background and gray border, focus with bright red ring

- **Icon Selection**:
  - Plus (Add personnel)
  - Pencil or PencilSimple (Edit)
  - Trash (Delete)
  - User or UserCircle (Personnel profile icon)
  - X (Close dialogs)
  - Check (Confirm actions)
  - Warning (Delete confirmation)

- **Spacing**:
  - Page padding: p-6 (md:p-8 for larger screens)
  - Card padding: p-4
  - Card gaps in grid: gap-4
  - Form field spacing: space-y-4
  - Section spacing: space-y-6

- **Mobile**:
  - Roster grid: Single column on mobile, 2 columns on md, 3 columns on lg
  - Dialog/forms: Full-screen on mobile with slide-up animation, centered modal on desktop
  - Reduce padding on mobile (p-4 instead of p-6)
  - Stack form fields vertically with full width
  - Larger touch targets for buttons (min-h-12 on mobile)
