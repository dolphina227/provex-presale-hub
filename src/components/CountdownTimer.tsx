import { CheckCircle2 } from "lucide-react";

export const CountdownTimer = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-center gap-3">
        <div className="p-3 rounded-lg bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold gradient-text mb-1">Presale is Live!</h3>
          <p className="text-sm text-muted-foreground">Buy ProveX 2.0 tokens now</p>
        </div>
      </div>
    </div>
  );
};
