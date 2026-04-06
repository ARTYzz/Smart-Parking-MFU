interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl bg-[#F3F4F5] p-8 text-center">
      <p className="label-caps text-xs font-semibold text-[#7D000F]/75">No Feed</p>
      <h3 className="display-font mt-2 text-2xl font-extrabold text-[#191C1D]">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[#59413F]">{description}</p>
    </div>
  );
}
