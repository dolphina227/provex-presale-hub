import { useState } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PresaleStats } from "@/components/PresaleStats";
import { BuyPanel } from "@/components/BuyPanel";
import { ParticipantsTable } from "@/components/ParticipantsTable";
import { InfoSection } from "@/components/InfoSection";
import { TokenDetails } from "@/components/TokenDetails";
import { AdminSettings } from "@/components/AdminSettings";
import { UserPosition } from "@/components/UserPosition";
import logo from "@/assets/provex-logo.png";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBuySuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="ProveX 2.0" className="h-12 w-12" />
              <div>
                <h1 className="text-xl font-bold gradient-text">ProveX 2.0 Presale</h1>
                <p className="text-xs text-muted-foreground">On PulseChain</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text">
              Join the ProveX 2.0 Presale on PulseChain
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the ProveX 2.0 presale on PulseChain. 50% supply for presale, 50% for LP. If hardcap is not
              reached, funds will be refunded. Future $ProveX airdrops for presale participants.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-8">
        {/* Token Details */}
        <TokenDetails />

        {/* Countdown */}
        <CountdownTimer />

        {/* Stats and Buy Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PresaleStats refreshTrigger={refreshTrigger} />
          <BuyPanel onBuySuccess={handleBuySuccess} />
        </div>

        {/* User Position */}
        <UserPosition refreshTrigger={refreshTrigger} onSuccess={handleBuySuccess} />

        {/* Participants Table */}
        <ParticipantsTable refreshTrigger={refreshTrigger} />

        {/* Info Section */}
        <InfoSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <span className="font-semibold gradient-text">ProveX 2.0</span> - Presale on PulseChain
            </p>
            <p>© 2025 ProveX 2.0. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Admin Settings */}
      <AdminSettings />
    </div>
  );
};

export default Index;
