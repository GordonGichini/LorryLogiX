const toneMap: Record<string, string> = {
  ACTIVE: "bg-[#d8e3ec] text-[#36536c] ring-[#b9cbd9]",
  INACTIVE: "bg-[#e1e5e8] text-[#687582] ring-[#ccd5dc]",
  DRAFT: "bg-[#e5e1d7] text-[#756b58] ring-[#d2c8b4]",
  SUSPENDED: "bg-[#e4dcd8] text-[#765f55] ring-[#cfbdb4]",
  EXPIRED: "bg-[#e5d9d7] text-[#795b5a] ring-[#d0baba]",
  TERMINATED: "bg-[#dfe3e6] text-[#687582] ring-[#c8d1d8]",
  PLANNED: "bg-[#dce5eb] text-[#4f687d] ring-[#c3d2de]",
  DISPATCHED: "bg-[#d6e1e8] text-[#45647b] ring-[#b9cad7]",
  IN_TRANSIT: "bg-[#d2e0ea] text-[#36536c] ring-[#b1c6d6]",
  DELIVERED: "bg-[#d8e4e7] text-[#49666d] ring-[#b9cfd3]",
  COMPLETED: "bg-[#d2e1dc] text-[#42635a] ring-[#b2cbbf]",
  CANCELLED: "bg-[#e1e5e8] text-[#687582] ring-[#ccd5dc]",
  FAILED: "bg-[#e5d9d7] text-[#795b5a] ring-[#d0baba]",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = toneMap[value] ?? "bg-[#e1e5e8] text-[#687582] ring-[#ccd5dc]";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}
