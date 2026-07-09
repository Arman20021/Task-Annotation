# Frontend - Task and Image Annotation App

This is the frontend for the **Task and Image Annotation** project.

It is built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Zustand**, **dnd-kit**, and **react-konva**.


## Villains I Faced

This frontend also had many villains.

The first villain was **token handling**. Old JWT tokens caused login problems. I solved it by not sending tokens to public authentication routes and by clearing bad tokens.

The second villain was the **upload form**. After upload, the form reset caused a runtime error. The error said `Cannot read properties of null`. I fixed it by using `useRef` for the file input instead of using `event.currentTarget.reset()`.

The third villain was **image batch design**. At first, every image appeared separately. But I needed one upload group to stay inside one div. I solved it by using image batches from the backend.

The fourth villain was **mouse wheel behavior**. The page was scrolling while images were changing. I fixed it by attaching the wheel event only to the image area.

The fifth villain was **polygon state**. Sometimes one polygon appeared on every image. Sometimes it disappeared when changing images. I solved it by storing draft polygons by image ID.

The last villain was **UI polish**. Button hover, cursor style, date format, and card size needed many small fixes. These were solved step by step with debugging, documentation, and AI help.



## Features

* Login page
* JWT token based frontend authentication
* Kanban task board
* Drag and drop task movement
* Task add, edit, and delete
* Date based task filter
* Image upload
* Upload many images at once
* Upload images one by one before final upload
* Image batch view
* Mouse wheel image navigation
* Zoom in and zoom out
* Polygon annotation
* Delete selected polygon or point

## Tech Stack

* Node.js 20.x recommended
* Next.js 16.2.10
* React 19.2.7
* TypeScript 5
* Tailwind CSS 4
* Axios
* Zustand
* dnd-kit
* Konva
* React Konva
* Zod
* React Hook Form
* Biome


## Project Dependencies

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "axios": "^1.18.1",
    "konva": "^10.3.0",
    "next": "^16.2.10",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-hook-form": "^7.81.0",
    "react-konva": "^19.2.5",
    "zod": "^4.4.3",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.0",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## Environment Setup

Create a file named `.env.local` in the frontend root folder.

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## How to Run

### 1. Go to the frontend folder

### 2. Install packages

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

 
## Build Project

To build the frontend:

```bash
npm run build
```

To start the production build:

```bash
npm run start
```

## Lint and Format

Run lint check:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

## Main Pages

```txt
/login
/tasks
/annotate
```

 