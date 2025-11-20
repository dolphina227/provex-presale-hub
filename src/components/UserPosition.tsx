import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/useWeb3";
import { CONTRACTS, PRESALE_ABI } from "@/lib/constants";
import { formatUnits } from "ethers";
import { toast } from "sonner";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserPositionProps {
  refreshTrigger: number;
  onSuccess: () => void;
}

export const UserPosition = ({ refreshTrigger, onSuccess }: UserPositionProps) => {
  const { account, isConnected, provider, getSigner } = useWeb3();
  const [userContribution, setUserContribution] = useState("0");
  const [userTokens, setUserTokens] = useState("0");
  const [isFinalized, setIsFinalized] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserPosition = async () => {
      if (!provider || !account) return;

      try {
        const presaleContract = new (await import("ethers")).Contract(
          CONTRACTS.presale,
          PRESALE_ABI,
          provider
        );

        const [contribution, tokens, finalized, succeeded] = await Promise.all([
          presaleContract.contributions(account),
          presaleContract.purchasedTokens(account),
          presaleContract.isFinalized(),
          presaleContract.success(),
        ]);

        setUserContribution(formatUnits(contribution, 6));
        setUserTokens(formatUnits(tokens, 18));
        setIsFinalized(finalized);
        setSuccess(succeeded);
      } catch (error) {
        console.error("Error fetching user position:", error);
      }
    };

    fetchUserPosition();
  }, [provider, account, refreshTrigger]);

  const handleClaimTokens = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsLoading(true);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Signer not available");

      const presaleContract = new (await import("ethers")).Contract(
        CONTRACTS.presale,
        PRESALE_ABI,
        signer
      );

      toast.info("Claiming tokens...");
      const tx = await presaleContract.claimTokens();
      await tx.wait();

      toast.success("Successfully claimed ProveX 2.0 tokens!");
      onSuccess();
    } catch (error: any) {
      console.error("Error claiming tokens:", error);
      toast.error(error.message || "Failed to claim tokens");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRefund = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsLoading(true);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Signer not available");

      const presaleContract = new (await import("ethers")).Contract(
        CONTRACTS.presale,
        PRESALE_ABI,
        signer
      );

      toast.info("Claiming refund...");
      const tx = await presaleContract.claimRefund();
      await tx.wait();

      toast.success("Successfully claimed USDC refund!");
      onSuccess();
    } catch (error: any) {
      console.error("Error claiming refund:", error);
      toast.error(error.message || "Failed to claim refund");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg gradient-bg">
            <Wallet className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Your Position</h2>
            <p className="text-sm text-muted-foreground">Connect wallet to view</p>
          </div>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connect your wallet to see your presale position</AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasContribution = parseFloat(userContribution) > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg gradient-bg">
          <TrendingUp className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Your Position</h2>
          <p className="text-sm text-muted-foreground">Track your presale allocation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Your USDC Contribution</p>
          <p className="text-2xl font-bold gradient-text">
            {parseFloat(userContribution).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC
          </p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Your Reserved ProveX 2.0</p>
          <p className="text-2xl font-bold gradient-text">
            {parseFloat(userTokens).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {!hasContribution && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You haven't participated in the presale yet</AlertDescription>
        </Alert>
      )}

      {hasContribution && !isFinalized && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Presale ongoing. You can buy more until hardcap or until the team finalizes the sale.
          </AlertDescription>
        </Alert>
      )}

      {hasContribution && isFinalized && success && (
        <div className="space-y-4">
          <Alert className="border-green-500/50 bg-green-500/10">
            <AlertCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">
              Presale succeeded! You can now claim your ProveX 2.0 tokens.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleClaimTokens}
            disabled={isLoading}
            className="w-full h-12 text-lg gradient-bg"
          >
            {isLoading ? "Claiming..." : "Claim ProveX 2.0"}
          </Button>
        </div>
      )}

      {hasContribution && isFinalized && !success && (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Presale failed. You can refund your USDC.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleClaimRefund}
            disabled={isLoading}
            variant="destructive"
            className="w-full h-12 text-lg"
          >
            {isLoading ? "Claiming..." : "Claim Refund"}
          </Button>
        </div>
      )}
    </div>
  );
};
