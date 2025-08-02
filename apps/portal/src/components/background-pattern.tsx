export function BackgroundPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[310px] w-[310px] rounded-full bg-brand-secondary opacity-20 blur-[100px]" />
    </div>
  );
}
