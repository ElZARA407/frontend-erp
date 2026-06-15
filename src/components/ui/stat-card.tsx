import { Card } from "./card";

type Props = {
  title: string;
  value: string;
  description?: string;
};

export function StatCard({ title, value, description }: Props) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </Card>
  );
}
