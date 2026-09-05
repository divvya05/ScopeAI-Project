// Vite compiles shared/*.mjs directly; TypeScript sees them as any here.
// Typed wrappers in src/config and src/lib cast to full interfaces.
declare module "*.mjs" {
  const content: any;
  export default content;
}