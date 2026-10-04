import { Dotm3x3_11 } from "@/components/ui/dotm-3x3-11";

export default function BlogLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading blog content"
      className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center border-x border-line"
    >
      <Dotm3x3_11
        dotShape="square"
        pattern="full"
        size={72}
        speed={1.4}
        colorPreset="solid-theme"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
