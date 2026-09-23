const toneMap: Record<string, string> = {
  ACTIVE: "bg-[#d9dfd0] text-[#4a5942] ring-[#bcc7af]",
  INACTIVE: "bg-[#e3e2db] text-[#6e7169] ring-[#d0cfc6]",
  DRAFT: "bg-[#e8dfcf] text-[#806747] ring-[#d7c6aa]",
  SUSPENDED: "bg-[#eadbcf] text-[#865f49] ring-[#d9baa4]",
  EXPIRED: "bg-[#ead6d0] text-[#875649] ring-[#d7b6ac]",
  TERMINATED: "bg-[#deddd6] text-[#65685f] ring-[#c9c8bf]",
  PLANNED: "bg-[#dfe2d9] text-[#5e6955] ring-[#c7ccb9]",
  DISPATCHED: "bg-[#d8dfd8] text-[#4e6658] ring-[#bdcabe]",
  IN_TRANSIT: "bg-[#d9dfd0] text-[#4a5942] ring-[#bcc7af]",
  DELIVERED: "bg-[#dce2d7] text-[#50634d] ring-[#c0cfba]",
  COMPLETED: "bg-[#d0dccd] text-[#466044] ring-[#b2c7ae]",
  CANCELLED: "bg-[#e3e2db] text-[#6e7169] ring-[#d0cfc6]",
  FAILED: "bg-[#ead6d0] text-[#875649] ring-[#d7b6ac]",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = toneMap[value] ?? "bg-[#e3e2db] text-[#65685f] ring-[#d0cfc6]";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}
