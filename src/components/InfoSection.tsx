import { Info, Shield, Gift, AlertTriangle, Copy, Check } from "lucide-react";
import { TAX_INFO, CONTRACTS } from "@/lib/constants";
import { useState } from "react";
import { toast } from "sonner";

export const InfoSection = () => {
  const [copiedAddress, setCopiedAddress] = useState<string>("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedAddress(""), 2000);
  };

  const AddressCard = ({ label, address }: { label: string; address: string }) => (
    <div className="bg-secondary/50 rounded-lg p-4 border border-border">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <code className="text-xs flex-1 font-mono break-all">{address}</code>
        <button
          onClick={() => copyToClipboard(address, label)}
          className="p-2 hover:bg-secondary rounded transition-colors"
        >
          {copiedAddress === address ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Trading Tax</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Buy/Sell tax: <span className="font-bold text-foreground">{TAX_INFO.buyTax}%</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Tax revenue will be used for sacrifices at{" "}
            <a
              href={TAX_INFO.sacrificeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {TAX_INFO.sacrificeUrl}
            </a>
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Future Airdrops</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Presale participants will receive future $ProveX airdrops as a reward for early support.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-semibold">Refund Policy</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            If the hardcap is not reached by the end of the presale, raised funds will be refunded to participants.
          </p>
        </div>
      </div>

      {/* Contract Addresses */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg gradient-bg">
            <Info className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Contract Addresses</h3>
            <p className="text-sm text-muted-foreground">Always verify addresses before interacting</p>
          </div>
        </div>

      <AddressCard
        label="Presale Contract"
        address="0x9c7B9B8C9c80Aa67C1AB1330e502df4e965F59b4"
      />
        <AddressCard label="ProveX 2.0 Token" address={CONTRACTS.token} />
        <AddressCard label="USDC (PulseChain)" address={CONTRACTS.usdc} />
      </div>

      {/* Disclaimer */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Disclaimer:</strong> This interface is a frontend for the on-chain
          ProveX 2.0 presale contract on PulseChain. Always double-check contract addresses before interacting.
          Cryptocurrency investments carry risk. Do your own research.
        </p>
      </div>
    </div>
  );
};
