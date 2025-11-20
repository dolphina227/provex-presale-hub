import { Coins, TrendingUp, PieChart, Info } from "lucide-react";
import { TOKEN_CONFIG, TOKENOMICS } from "@/lib/constants";
import logo from "@/assets/provex-logo.png";

export const TokenDetails = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <img src={logo} alt="ProveX 2.0" className="h-16 w-16 rounded-lg" />
        <div>
          <h2 className="text-2xl font-bold gradient-text">{TOKEN_CONFIG.name}</h2>
          <p className="text-muted-foreground">Symbol: {TOKEN_CONFIG.symbol}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gradient-from/10 to-gradient-via-1/10 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Total Supply</p>
          </div>
          <p className="text-2xl font-bold gradient-text">
            {TOKEN_CONFIG.totalSupply.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{TOKEN_CONFIG.symbol}</p>
        </div>

        <div className="bg-gradient-to-br from-gradient-via-1/10 to-gradient-via-2/10 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Presale Supply</p>
          </div>
          <p className="text-2xl font-bold gradient-text">
            {TOKENOMICS.presaleAllocation.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{TOKENOMICS.presalePercent}% of total</p>
        </div>

        <div className="bg-gradient-to-br from-gradient-via-2/10 to-gradient-to/10 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">LP Supply</p>
          </div>
          <p className="text-2xl font-bold gradient-text">
            {TOKENOMICS.lpAllocation.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{TOKENOMICS.lpPercent}% of total</p>
        </div>
      </div>

      <div className="bg-secondary/50 rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Token Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{TOKEN_CONFIG.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Symbol:</span>
            <span className="font-medium">{TOKEN_CONFIG.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Decimals:</span>
            <span className="font-medium">{TOKEN_CONFIG.decimals}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-medium">PulseChain</span>
          </div>
        </div>
      </div>
    </div>
  );
};
