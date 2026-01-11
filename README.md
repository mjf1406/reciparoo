<!-- @format -->

# Recipe Manager

## Links

- [Shadcn Project](https://ui.shadcn.com/create?base=base&style=nova&baseColor=stone&theme=amber&iconLibrary=lucide&font=inter&menuAccent=bold&menuColor=default&radius=large&item=preview)
- [Hosted on Cloudflare Pages](https://reciparoo.pages.dev/)

## Change Log

### 2026/01/11

- UX: added folders and sub-folders
- UX: added video URL to recipes
- UX: public recipe pages now use recipe title and description as page metadata

### 2026/01/10

- UX: added public recipe page
- UI: made light mode card bg darker
- UI: instructions now supports multiple sections with titles and their own numbered steps
- UI: added yield, serving size, and serving unit to recipe detail page
- UX: users can view recipes
- UI: added created and updated timestamps to recipe detail page
- UX: users can add and view notes for recipes
- BE: all recipes are public now for sharing with anyone
- DX: created useHomeRecipes hook
- DX: created useRecipe hook
- UX: user can now create recipes
- UX: user can now edit and delete recipes
- UI: added manage member cards
- UX: owners/admins can now manage members of their home
- UX: user can now join homes using join codes
- UI: adjusted nav user display name to be hidden on mobile and shown on desktop
- UI: added under construction image to home child pages
- DX: created image skeleton component
- UI: added home child pages: recipes, calendar, grocery list, pantry
- UI: added breadcrumb navigation to home child pages
- UI: added action menu to home card
- UX: user can now edit and delete homes
- UI: added created and updated timestamps to home card

### 2026/01/09

- UI: added home icon to /home/$homeId page title
- UX: user can now create homes
- DX: initialized repository with tailwind, shadcn, InstantDB, and auth components
