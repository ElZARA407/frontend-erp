type Props = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: Props) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
