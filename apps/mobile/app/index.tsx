// apps/mobile/app/index.tsx
import { Slot } from "expo-router";

// No additional provider here; ThemeProvider lives inside app/_layout.tsx.
export default function App() {
  return <Slot />;
}
