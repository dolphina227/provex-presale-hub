import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/useWeb3";
import { Settings, Calendar, Clock, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AdminSettings = () => {
  const { account, isConnected, isCorrectNetwork } = useWeb3();
  const [isAdmin, setIsAdmin] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Admin addresses - add your admin wallet addresses here
  const ADMIN_ADDRESSES = [
    "0x0000000000000000000000000000000000000000", // Replace with actual admin address
  ].map((addr) => addr.toLowerCase());

  useEffect(() => {
    if (account) {
      const isAdminUser = ADMIN_ADDRESSES.includes(account.toLowerCase());
      setIsAdmin(isAdminUser);
    } else {
      setIsAdmin(false);
    }
  }, [account]);

  useEffect(() => {
    // Load current settings from localStorage
    const savedStartTimestamp = localStorage.getItem("presale_start_timestamp");
    const savedEndTimestamp = localStorage.getItem("presale_end_timestamp");

    if (savedStartTimestamp) {
      const startDateTime = new Date(parseInt(savedStartTimestamp) * 1000);
      setStartDate(startDateTime.toISOString().split("T")[0]);
      setStartTime(startDateTime.toTimeString().slice(0, 5));
    }

    if (savedEndTimestamp) {
      const endDateTime = new Date(parseInt(savedEndTimestamp) * 1000);
      setEndDate(endDateTime.toISOString().split("T")[0]);
      setEndTime(endDateTime.toTimeString().slice(0, 5));
    }
  }, []);

  const handleSaveSettings = () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Please fill in all date and time fields");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (startDateTime >= endDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    const startTimestamp = Math.floor(startDateTime.getTime() / 1000);
    const endTimestamp = Math.floor(endDateTime.getTime() / 1000);

    // Save to localStorage
    localStorage.setItem("presale_start_timestamp", startTimestamp.toString());
    localStorage.setItem("presale_end_timestamp", endTimestamp.toString());

    toast.success("Presale schedule updated successfully!");
    
    // Reload page to apply new settings
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const getCurrentSettings = () => {
    const savedStart = localStorage.getItem("presale_start_timestamp");
    const savedEnd = localStorage.getItem("presale_end_timestamp");

    if (savedStart && savedEnd) {
      const startDateTime = new Date(parseInt(savedStart) * 1000);
      const endDateTime = new Date(parseInt(savedEnd) * 1000);
      return {
        start: startDateTime.toLocaleString(),
        end: endDateTime.toLocaleString(),
      };
    }
    return null;
  };

  if (!isConnected) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  const currentSettings = getCurrentSettings();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!showSettings ? (
        <Button
          onClick={() => setShowSettings(true)}
          className="h-14 w-14 rounded-full shadow-lg gradient-bg"
          size="icon"
        >
          <Settings className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-96 p-6 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg gradient-bg">
                  <Settings className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Admin Settings</h3>
                  <p className="text-xs text-muted-foreground">Configure presale schedule</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
                className="h-8 w-8"
              >
                ✕
              </Button>
            </div>

            {currentSettings && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <div>Current: {currentSettings.start}</div>
                  <div>Ends: {currentSettings.end}</div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Start Date & Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  End Date & Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              className="w-full gradient-bg"
              disabled={!isCorrectNetwork}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Schedule
            </Button>

            {!isCorrectNetwork && (
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Please connect to PulseChain network
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
