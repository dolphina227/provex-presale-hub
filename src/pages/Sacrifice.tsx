import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "@/hooks/useWeb3";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, TrendingUp, History, ExternalLink, Home } from "lucide-react";
import { formatUnits } from "ethers";
import { AdminSettings } from "@/components/AdminSettings";
import logo from "@/assets/provex-logo.png";
import { WalletConnect } from "@/components/WalletConnect";

const SACRIFICE_ADDRESS = "0x92C9d5cCE713e96517D804CD6fB2e61Fa8f3572B";

interface Transaction {
  hash: string;
  from: string;
  value: string;
  timestamp: number;
  blockNumber: number;
}

const Sacrifice = () => {
  const { provider } = useWeb3();
  const [balance, setBalance] = useState<string>("0");
  const [txCount, setTxCount] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSacrificeData = async () => {
      if (!provider) return;
      
      try {
        setLoading(true);
        
        // Get balance
        const bal = await provider.getBalance(SACRIFICE_ADDRESS);
        setBalance(formatUnits(bal, 18));
        
        // Get transaction count
        const count = await provider.getTransactionCount(SACRIFICE_ADDRESS);
        setTxCount(count);
        
        // Fetch recent transactions (last 50 blocks as example)
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 50000);
        
        const txs: Transaction[] = [];
        
        // Query blocks for transactions to this address
        for (let i = currentBlock; i > fromBlock && txs.length < 20; i -= 1000) {
          try {
            const block = await provider.getBlock(i, true);
            if (block && block.transactions) {
              for (const txData of block.transactions) {
                if (typeof txData !== 'string') {
                  const tx = txData as any;
                  if (tx.to?.toLowerCase() === SACRIFICE_ADDRESS.toLowerCase()) {
                    txs.push({
                      hash: tx.hash,
                      from: tx.from,
                      value: formatUnits(tx.value, 18),
                      timestamp: block.timestamp,
                      blockNumber: block.number,
                    });
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Error fetching block ${i}:`, err);
          }
        }
        
        setTransactions(txs.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error("Error fetching sacrifice data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSacrificeData();
  }, [provider]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = (hash: string) => {
    window.open(`https://scan.pulsechain.com/tx/${hash}`, "_blank");
  };

  const openAddressExplorer = (address: string) => {
    window.open(`https://scan.pulsechain.com/address/${address}`, "_blank");
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
                <h1 className="text-xl font-bold gradient-text">ProveX 2.0 Sacrifice</h1>
                <p className="text-xs text-muted-foreground">On Ethereum</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  Presale
                </Button>
              </Link>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text">
            Sacrifice Tracker
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track all sacrifices made to the ProveX 2.0 sacrifice address on Ethereum
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Sacrificed</p>
                {loading ? (
                  <Skeleton className="h-8 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-bold gradient-text">
                    {parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                {loading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold gradient-text">{txCount.toLocaleString()}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Sacrifice Address</p>
                <button
                  onClick={() => openAddressExplorer(SACRIFICE_ADDRESS)}
                  className="text-sm font-mono text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mt-1"
                >
                  {formatAddress(SACRIFICE_ADDRESS)}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-semibold gradient-text">Recent Sacrifice Transactions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Latest transactions to the sacrifice address
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Transaction Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount (ETH)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Block
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No recent transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.hash} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openExplorer(tx.hash)}
                          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-mono text-sm"
                        >
                          {formatAddress(tx.hash)}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openAddressExplorer(tx.from)}
                          className="text-muted-foreground hover:text-foreground transition-colors font-mono text-sm"
                        >
                          {formatAddress(tx.from)}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {parseFloat(tx.value).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {tx.blockNumber.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Admin Settings */}
      <AdminSettings />
    </div>
  );
};

export default Sacrifice;
