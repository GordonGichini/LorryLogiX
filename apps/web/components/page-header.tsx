type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col gap-3 border-b border-[#d5d4cb] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">Workspace</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#1c2835]">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#6c7782]">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
