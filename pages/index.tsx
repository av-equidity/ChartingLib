import Head from "next/head";
import dynamic from "next/dynamic";
import { useState } from "react";
import Script from "next/script";

import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "@/public/static/charting_library/charting_library";

const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
  symbol: "XAUUSD",
  interval: "3" as ResolutionString,
  library_path: "/static/charting_library/",
  locale: "en",
  charts_storage_url: "https://saveload.tradingview.com",
  charts_storage_api_version: "1.1",
  client_id: "tradingview.com",
  user_id: "public_user_id",
  fullscreen: false,
  autosize: true,
};

const TVChartContainer = dynamic(
  () =>
    import("@/components/TVChartContainer").then((mod) => mod.TVChartContainer),
  { ssr: false }
);

export default function Home() {
  const [isScriptReady, setIsScriptReady] = useState(true);
  return (
    <>
      <Head>
        <title>TradingView Charting Library</title>
      </Head>
      {isScriptReady && <TVChartContainer {...defaultWidgetProps} />}
    </>
  );
}
