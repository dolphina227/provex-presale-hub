import { useEffect, useState } from "react";
import { PRESALE_CONFIG } from "@/lib/constants";
import { Clock } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [status, setStatus] = useState<"not-started" | "live" | "ended">("not-started");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const startTime = PRESALE_CONFIG.startTimestamp;
      const endTime = PRESALE_CONFIG.endTimestamp;

      if (now < startTime) {
        setStatus("not-started");
        const difference = startTime - now;
        return calculateTime(difference);
      } else if (now >= startTime && now <= endTime) {
        setStatus("live");
        const difference = endTime - now;
        return calculateTime(difference);
      } else {
        setStatus("ended");
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    const calculateTime = (difference: number): TimeLeft => {
      return {
        days: Math.floor(difference / (60 * 60 * 24)),
        hours: Math.floor((difference / (60 * 60)) % 24),
        minutes: Math.floor((difference / 60) % 60),
        seconds: Math.floor(difference % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3 min-w-[70px]">
        <div className="text-3xl font-bold gradient-text">{value.toString().padStart(2, "0")}</div>
      </div>
      <div className="text-xs text-muted-foreground mt-2 uppercase">{label}</div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          {status === "not-started" && "Presale Starts In"}
          {status === "live" && "Presale Ends In"}
          {status === "ended" && "Presale Ended"}
        </h3>
      </div>

      {status !== "ended" ? (
        <div className="flex justify-center gap-4">
          <TimeBlock value={timeLeft.days} label="Days" />
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <TimeBlock value={timeLeft.minutes} label="Minutes" />
          <TimeBlock value={timeLeft.seconds} label="Seconds" />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-2xl font-bold text-muted-foreground">The presale has ended</p>
        </div>
      )}
    </div>
  );
};
