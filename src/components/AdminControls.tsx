import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/useWeb3";
import { CONTRACTS, PRESALE_ABI } from "@/lib/constants";
import { Shield, Play, Pause, CheckCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Admin addresses - must match AdminSettings
const ADMIN_ADDRESSES = [
  "0x432b52a5fafe90f831db31a70381459110f17280",
].map((addr) => addr.toLowerCase());

export const AdminControls = () => {
  const { account, isConnected, isCorrectNetwork, getSigner, provider } = useWeb3();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (account) {
      const isAdminUser = ADMIN_ADDRESSES.includes(account.toLowerCase());
      setIsAdmin(isAdminUser);
    } else {
      setIsAdmin(false);
    }
  }, [account]);

  useEffect(() => {
    const fetchPresaleStatus = async () => {
      if (!provider) return;

      try {
        const presaleContract = new (await import("ethers")).Contract(
          CONTRACTS.presale,
          PRESALE_ABI,
          provider
        );

        const [live, finalized] = await Promise.all([
          presaleContract.isLive(),
          presaleContract.isFinalized(),
        ]);

        setIsLive(live);
        setIsFinalized(finalized);
      } catch (error) {
        console.error("Error fetching presale status:", error);
      }
    };

    fetchPresaleStatus();
  }, [provider]);

  const handleSetLive = async (live: boolean) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!isCorrectNetwork) {
      toast.error("Please switch to PulseChain network");
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

      toast.info(live ? "Starting presale..." : "Pausing presale...");
      const tx = await presaleContract.setLive(live);
      await tx.wait();

      setIsLive(live);
      toast.success(live ? "Presale is now live!" : "Presale paused");
      
      // Reload to refresh all data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error("Error setting presale status:", error);
      toast.error(error.message || "Failed to update presale status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!isCorrectNetwork) {
      toast.error("Please switch to PulseChain network");
      return;
    }

    if (!confirm("Are you sure you want to finalize the presale? This action cannot be undone.")) {
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

      toast.info("Finalizing presale...");
      const tx = await presaleContract.finalize();
      await tx.wait();

      setIsFinalized(true);
      toast.success("Presale finalized successfully!");
      
      // Reload to refresh all data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error("Error finalizing presale:", error);
      toast.error(error.message || "Failed to finalize presale");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected || !isAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {!showControls ? (
        <Button
          onClick={() => setShowControls(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
          size="icon"
          title="Admin Controls"
        >
          <Shield className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-96 p-6 shadow-2xl border-2 border-purple-500/20 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <h3 className="font-bold text-lg">Admin Controls</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(false)}
            >
              ✕
            </Button>
          </div>

          <Alert className="mb-4 border-purple-500/50 bg-purple-500/10">
            <Settings className="h-4 w-4 text-purple-500" />
            <AlertDescription className="text-purple-500">
              Admin-only controls for presale management
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Presale Status</span>
                <span className={`text-xs px-2 py-1 rounded ${isLive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                  {isLive ? 'Live' : 'Paused'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Finalized</span>
                <span className={`text-xs px-2 py-1 rounded ${isFinalized ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                  {isFinalized ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {!isFinalized && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Presale Controls</p>
                {isLive ? (
                  <Button
                    onClick={() => handleSetLive(false)}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    {isLoading ? "Processing..." : "Pause Presale"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSetLive(true)}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isLoading ? "Processing..." : "Start Presale"}
                  </Button>
                )}

                <Button
                  onClick={handleFinalize}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : "Finalize Presale"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ Finalization cannot be undone
                </p>
              </div>
            )}

            {isFinalized && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Presale has been finalized. No further changes can be made.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
