import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { CONTRACTS, PRESALE_ABI, TOKEN_CONFIG, TOKENOMICS } from "@/lib/constants";
import { formatUnits, Contract } from "ethers";
import { TrendingUp, Target, Coins, Activity, DollarSign, ShoppingBag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PresaleData {
  isLive: boolean;
  isFinalized: boolean;
  success: boolean;
  soldTokens: bigint;
  totalUsdcIn: bigint;
  presaleTokens: bigint;
  hardCapUsdc: bigint;
  minUsdc: bigint;
  tokensPerUsdc: bigint;
}

export const PresaleStats = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const { provider } = useWeb3();
  const [presaleData, setPresaleData] = useState<PresaleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresaleData = async () => {
      if (!provider) {
        setLoading(false);
        return;
      }

      try {
        const presaleContract = new Contract(
          CONTRACTS.presale,
          PRESALE_ABI,
          provider
        );

        const [isLive, isFinalized, success, sold, totalUsdc, presaleTokens, hardCapUsdc, minUsdc, tokensPerUsdc] = await Promise.all([
          presaleContract.isLive(),
          presaleContract.isFinalized(),
          presaleContract.success(),
          presaleContract.soldTokens(),
          presaleContract.totalUsdcIn(),
          presaleContract.PRESALE_TOKENS(),
          presaleContract.HARD_CAP_USDC(),
          presaleContract.MIN_USDC(),
          presaleContract.TOKENS_PER_USDC(),
        ]);

        setPresaleData({
          isLive,
          isFinalized,
          success,
          soldTokens: sold,
          totalUsdcIn: totalUsdc,
          presaleTokens,
          hardCapUsdc,
          minUsdc,
          tokensPerUsdc,
        });
      } catch (error) {
        console.error("Error fetching presale data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresaleData();
  }, [provider, refreshTrigger]);

  const calculateProgress = () => {
    if (!presaleData) return 0;
    return Number((presaleData.soldTokens * 100n) / presaleData.presaleTokens);
  };

  const getStatusText = () => {
    if (!presaleData) return "Loading...";
    if (!presaleData.isFinalized && presaleData.isLive) return "Live";
    if (!presaleData.isFinalized && !presaleData.isLive) return "Paused";
    if (presaleData.isFinalized && presaleData.success) return "Finalized (Success)";
    if (presaleData.isFinalized && !presaleData.success) return "Finalized (Failed – Refund Enabled)";
    return "Unknown";
  };

  const getStatusVariant = () => {
    if (!presaleData) return "secondary";
    if (!presaleData.isFinalized && presaleData.isLive) return "default";
    if (!presaleData.isFinalized && !presaleData.isLive) return "secondary";
    if (presaleData.isFinalized && presaleData.success) return "default";
    return "destructive";
  };

  const StatCard = ({ icon: Icon, label, value }: any) => (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="text-lg font-bold mt-1">{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Presale Statistics</h2>
        <p className="text-muted-foreground">Live presale data from PulseChain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={Coins}
          label="Total Supply"
          value={loading ? <Skeleton className="h-6 w-32" /> : `${TOKEN_CONFIG.totalSupply.toLocaleString()} ${TOKEN_CONFIG.symbol}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Hardcap"
          value={loading ? <Skeleton className="h-6 w-24" /> : `${presaleData ? formatUnits(presaleData.hardCapUsdc, 6) : "8,000"} USDC`}
        />
        <StatCard
          icon={DollarSign}
          label="Minimum Buy"
          value={loading ? <Skeleton className="h-6 w-24" /> : `${presaleData ? formatUnits(presaleData.minUsdc, 6) : "10"} USDC`}
        />
        <StatCard
          icon={Coins}
          label="Rate"
          value={loading ? <Skeleton className="h-6 w-24" /> : `1 USDC = ${presaleData ? parseFloat(formatUnits(presaleData.tokensPerUsdc, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "6,250"} ProveX`}
        />
        <StatCard
          icon={Activity}
          label="Status"
          value={
            loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <Badge variant={getStatusVariant()}>
                {getStatusText()}
              </Badge>
            )
          }
        />
        <StatCard
          icon={Target}
          label="Tokens Sold"
          value={
            loading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `${presaleData ? parseFloat(formatUnits(presaleData.soldTokens, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"} / ${presaleData ? parseFloat(formatUnits(presaleData.presaleTokens, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "50,000,000"}`
            )
          }
        />
        <StatCard
          icon={ShoppingBag}
          label="USDC Raised"
          value={
            loading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `${presaleData ? parseFloat(formatUnits(presaleData.totalUsdcIn, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0"} USDC`
            )
          }
        />
        <StatCard
          icon={Coins}
          label="Presale Allocation"
          value={loading ? <Skeleton className="h-6 w-32" /> : `${TOKENOMICS.presaleAllocation.toLocaleString()} (${TOKENOMICS.presalePercent}%)`}
        />
        <StatCard
          icon={Coins}
          label="LP Allocation"
          value={loading ? <Skeleton className="h-6 w-32" /> : `${TOKENOMICS.lpAllocation.toLocaleString()} (${TOKENOMICS.lpPercent}%)`}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">
            {loading ? <Skeleton className="h-4 w-12 inline-block" /> : `${calculateProgress()}%`}
          </span>
        </div>
        <Progress value={calculateProgress()} className="h-3" />
      </div>
    </div>
  );
};
