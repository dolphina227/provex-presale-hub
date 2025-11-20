import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/hooks/useWeb3";
import { CONTRACTS, PRESALE_ABI, ERC20_ABI, PRESALE_CONFIG, USDC_DECIMALS } from "@/lib/constants";
import { parseUnits, formatUnits } from "ethers";
import { toast } from "sonner";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BuyPanelProps {
  onBuySuccess: () => void;
}

export const BuyPanel = ({ onBuySuccess }: BuyPanelProps) => {
  const { account, isConnected, isCorrectNetwork, getSigner, provider } = useWeb3();
  const [usdcAmount, setUsdcAmount] = useState("");
  const [tokensToReceive, setTokensToReceive] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [tokensPerUSDC, setTokensPerUSDC] = useState<bigint>(0n);
  const [isPresaleLive, setIsPresaleLive] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [hardCapUsdc, setHardCapUsdc] = useState<bigint>(0n);
  const [totalUsdcIn, setTotalUsdcIn] = useState<bigint>(0n);
  const [presaleEnded, setPresaleEnded] = useState(false);

  useEffect(() => {
    const fetchPresaleInfo = async () => {
      if (!provider) return;

      try {
        const presaleContract = new (await import("ethers")).Contract(
          CONTRACTS.presale,
          PRESALE_ABI,
          provider
        );

        const [isLive, isFinalized, tokensPerUsdc, hardCap, totalUsdc] = await Promise.all([
          presaleContract.isLive(),
          presaleContract.isFinalized(),
          presaleContract.TOKENS_PER_USDC(),
          presaleContract.HARD_CAP_USDC(),
          presaleContract.totalUsdcIn(),
        ]);

        setIsPresaleLive(isLive);
        setIsFinalized(isFinalized);
        setTokensPerUSDC(tokensPerUsdc);
        setHardCapUsdc(hardCap);
        setTotalUsdcIn(totalUsdc);

        // Check if presale ended
        const now = Math.floor(Date.now() / 1000);
        const endTime = PRESALE_CONFIG.endTimestamp;
        setPresaleEnded(now > endTime);
      } catch (error) {
        console.error("Error fetching presale info:", error);
      }
    };

    fetchPresaleInfo();
  }, [provider]);

  useEffect(() => {
    if (usdcAmount && tokensPerUSDC > 0n) {
      try {
        const usdcAmountBigInt = parseUnits(usdcAmount, USDC_DECIMALS);
        const tokens = (usdcAmountBigInt * tokensPerUSDC) / BigInt(10 ** USDC_DECIMALS);
        setTokensToReceive(formatUnits(tokens, 18));
      } catch {
        setTokensToReceive("0");
      }
    } else {
      setTokensToReceive("0");
    }
  }, [usdcAmount, tokensPerUSDC]);

  const handleBuy = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!isCorrectNetwork) {
      toast.error("Please switch to PulseChain network");
      return;
    }

    const amount = parseFloat(usdcAmount);
    if (isNaN(amount) || amount < PRESALE_CONFIG.minBuyUSDC) {
      toast.error(`Minimum buy amount is ${PRESALE_CONFIG.minBuyUSDC} USDC`);
      return;
    }

    // Check if purchase would exceed hardcap
    const usdcAmountBigInt = parseUnits(usdcAmount, USDC_DECIMALS);
    if (totalUsdcIn + usdcAmountBigInt > hardCapUsdc) {
      toast.error("Purchase would exceed hardcap");
      return;
    }

    setIsLoading(true);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Signer not available");

      const usdcContract = new (await import("ethers")).Contract(CONTRACTS.usdc, ERC20_ABI, signer);
      const presaleContract = new (await import("ethers")).Contract(CONTRACTS.presale, PRESALE_ABI, signer);

      const usdcAmountBigInt = parseUnits(usdcAmount, USDC_DECIMALS);

      // Check allowance
      const allowance = await usdcContract.allowance(account, CONTRACTS.presale);
      
      if (allowance < usdcAmountBigInt) {
        toast.info("Approving USDC...");
        const approveTx = await usdcContract.approve(CONTRACTS.presale, usdcAmountBigInt);
        await approveTx.wait();
        toast.success("USDC approved");
      }

      // Buy tokens
      toast.info("Buying tokens...");
      const buyTx = await presaleContract.buy(usdcAmountBigInt);
      await buyTx.wait();

      toast.success("Successfully purchased ProveX 2.0 tokens!");
      setUsdcAmount("");
      onBuySuccess();
    } catch (error: any) {
      console.error("Error buying tokens:", error);
      toast.error(error.message || "Failed to buy tokens");
    } finally {
      setIsLoading(false);
    }
  };

  const canBuy = isConnected && isCorrectNetwork && isPresaleLive && !presaleEnded && !isFinalized;
  const showWarning = !isPresaleLive || presaleEnded || isFinalized;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg gradient-bg">
          <ShoppingCart className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Join the Presale</h2>
          <p className="text-sm text-muted-foreground">Buy ProveX 2.0 with USDC</p>
        </div>
      </div>

      {showWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isFinalized 
              ? "Presale has been finalized" 
              : presaleEnded 
              ? "The presale has ended" 
              : "Presale is not currently live"}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">USDC Amount</label>
          <Input
            type="number"
            placeholder={`Enter amount (min ${PRESALE_CONFIG.minBuyUSDC} USDC)`}
            value={usdcAmount}
            onChange={(e) => setUsdcAmount(e.target.value)}
            disabled={!canBuy || isLoading}
            className="text-lg h-12"
            min={PRESALE_CONFIG.minBuyUSDC}
            step="0.01"
          />
        </div>

        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">You will receive approximately</p>
          <p className="text-2xl font-bold gradient-text">
            {parseFloat(tokensToReceive).toLocaleString(undefined, { maximumFractionDigits: 2 })} ProveX 2.0
          </p>
        </div>

        {usdcAmount && parseFloat(usdcAmount) < PRESALE_CONFIG.minBuyUSDC && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Minimum buy amount is {PRESALE_CONFIG.minBuyUSDC} USDC</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleBuy}
          disabled={!canBuy || isLoading || !usdcAmount || parseFloat(usdcAmount) < PRESALE_CONFIG.minBuyUSDC}
          className="w-full h-12 text-lg gradient-bg"
        >
          {isLoading ? "Processing..." : "Buy ProveX 2.0 Presale"}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          <p>Make sure you have sufficient USDC in your wallet</p>
          <p className="mt-1">Minimum buy: {PRESALE_CONFIG.minBuyUSDC} USDC</p>
        </div>
      </div>
    </div>
  );
};
