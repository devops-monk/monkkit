"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function MyIpTool({ toolMeta: _ }: ToolComponentProps) {
  const [ip, setIp] = useState("");
  const [ipv6, setIpv6] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const run = async () => {
    setLoading(true);
    const r = await process({});
    if (r.success) { setIp(r.ip ?? ""); setIpv6(r.ipv6 ?? ""); setError(""); }
    else setError(r.error!);
    setLoading(false);
  };

  useEffect(() => { run(); }, []);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-md mx-auto">
      <Button variant="outline" size="sm" onClick={run} disabled={loading} className="w-fit">Refresh</Button>
      {error && <ErrorDisplay message={error} />}
      {loading && <p className="text-sm text-muted-foreground">Detecting your IP…</p>}
      {ip && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">IPv4 Address</span>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold">{ip}</code>
              <CopyButton value={ip} />
            </div>
          </div>
          {ipv6 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">IPv6 Address</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">{ipv6}</code>
                <CopyButton value={ipv6} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
