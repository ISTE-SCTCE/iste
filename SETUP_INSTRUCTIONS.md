# Setting Up the React/Shadcn Project

The current workspace appears to be a basic HTML/CSS/JS project. To use the `GlowingEffect` component, you need a React environment with Tailwind CSS and Typescript support.

## Prerequisites

1.  **Install Node.js**: You need Node.js and npm installed. Download it from [nodejs.org](https://nodejs.org/).
    *   Verify installation by running `node -v` and `npm -v` in a terminal.
2.  **Install Git**: It is recommended to have Git installed. Download from [git-scm.com](https://git-scm.com/).

## Setup Instructions

Once Node.js is installed, follow these steps to create a new modern web application in this folder (or a subfolder):

1.  **Initialize a Next.js App**:
    ```powershell
    npx create-next-app@latest my-app --typescript --tailwind --eslint
    ```
    *   You can replace `my-app` with `.` to initialize in the current folder (be careful not to overwrite existing files) or `web-app` for a subfolder.

2.  **Initialize Shadcn UI**:
    Navigate to your app directory:
    ```powershell
    cd my-app
    npx shadcn@latest init
    ```
    *   Follow the prompts (choose "New York", "Zinc", etc.).

3.  **Install Dependencies**:
    The component requires `motion` (Framer Motion) and `lucide-react`.
    ```powershell
    npm install motion lucide-react clsx tailwind-merge
    ```

4.  **Move the Component Files**:
    If you created a new subfolder (e.g., `my-app`), move the `components` and `lib` folders created by this assistant into the `src` folder of your new app.
    *   `components/ui/glowing-effect.tsx` -> `my-app/components/ui/glowing-effect.tsx`
    *   `components/glowing-effect-demo.tsx` -> `my-app/components/glowing-effect-demo.tsx`
    *   `lib/utils.ts` -> `my-app/lib/utils.ts` (Shadcn might create this for you, you can overwrite or merge).

## Using the Component

Import and use the demo in your `page.tsx`:

```tsx
import { GlowingEffectDemo } from "@/components/glowing-effect-demo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GlowingEffectDemo />
    </main>
  );
}
```
