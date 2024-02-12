import { chartHistory } from "@/types/chartHistory";
import { symbols } from "@/types/symbols";
import { subscribeOnStream, unsubscribeFromStream } from "./streaming";

let savedSymbols: symbols[] = [];
let toTimeStamp: number = 0;

const configurationData = {
    // Represents the resolutions for bars supported by your datafeed
    supported_resolutions: ['1', '3', '5', '15', '30', '60','120', '240'],
    // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
    // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
    symbols_types: [
        { name: 'forex', value: 'forex'}
    ]
};
let flag:boolean = false;
async function getAllSymbols() {
    if(savedSymbols.length > 0){
        console.log("Already got the symbols");
        return savedSymbols;
    }else{
    const response = await fetch('api/symbolsData');
    const data: symbols[] = await response.json();
    savedSymbols = data;
    return data;
    }
}
async function getChartHistory(path:string) {
    const response = await fetch(`api/chartHistoryData?${path}`);
    const data = await response.json();
    return data;
}

export default {
    onReady: (callback:any) => {
        console.log('[onReady]: Method call');
    setTimeout(() => callback(configurationData));
    },

    searchSymbols: async (userInput:any, exchange:any, symbolType:any, onResultReadyCallback:any) => {
        console.log('[searchSymbols]: Method call');
        const symbols = await getAllSymbols();
    const newSymbols = symbols.filter(symbol => {
        const isFullSymbolContainsInput = symbol.symbol
            .toLowerCase()
            .indexOf(userInput.toLowerCase()) !== -1;
        return isFullSymbolContainsInput;
    });
    onResultReadyCallback(newSymbols);
    },

    resolveSymbol: async (
        symbolName: string,
        onSymbolResolvedCallback: any,
        onResolveErrorCallback: any,
        extension: any
    ) => {
        console.log('[resolveSymbol]: Method call', symbolName);
        const symbols = await getAllSymbols();
        let symbolItem = symbols[0];
        for(let i=0; i<symbols.length; i++){
            if(symbols[i].symbol === symbolName){
                symbolItem = symbols[i];
            }
        }
        if (!symbolItem) {
            console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
            onResolveErrorCallback('Cannot resolve symbol');
            return;
        }
        // Symbol information object
        const symbolInfo = {
            ticker: symbolItem.symbol,
            name: symbolItem.symbol,
            description: symbolItem.description,
            type: symbolItem.path,
            session: '0000-0000',
            timezone: 'Etc/UTC',
            exchange: 'Forex',
            minmov: 1,
            pricescale: symbolItem.multiply,
            has_intraday: true,
            visible_plots_set: 'ohlc',
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        };
        console.log('[resolveSymbol]: Symbol resolved', symbolName);
        onSymbolResolvedCallback(symbolInfo);
    },
    getBars: async (symbolInfo:any, resolution:any, periodParams:any, onHistoryCallback:any, onErrorCallback:any) => {
        if(flag)
        setTimeout('100000',10000);
        console.log('[getBars]: Method call', symbolInfo);
        const { from, to, firstDataRequest } = periodParams;
        toTimeStamp = to;
        const urlParameters = {
            symbol: symbolInfo.name,
            fromTs: from,
            toTs: to
        };
        const query = Object.keys(urlParameters)
            .map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
                .join('&');
        try {
            const response = await getChartHistory(query);
            if (response.status == 200 && response.data) {
                // "noData" should be set if there is no data in the requested period
                console.log("Chart API CAll successfull")
                console.log("Here is data "+ response.data)
            }
            const data = response.data;
            let bars:chartHistory[] = [];
            console.log(JSON.stringify(data.data))
            console.log(`[getBars]: returned ${bars.length} bar(s)`);
            flag=true;
            onHistoryCallback(data, { noData: false });
        } catch (error) {
            console.log('[getBars]: Get error', error);
            onErrorCallback(error);
        }
    },
    subscribeBars: (
        symbolInfo:any,
        resolution:any,
        onRealtimeCallback:any,
        subscriberUID:any,
        onResetCacheNeededCallback:any
    ) => {
        console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
        subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscriberUID,
            onResetCacheNeededCallback,
            toTimeStamp)
        );
    },

    unsubscribeBars: (subscriberUID:any) => {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        unsubscribeFromStream(subscriberUID);
    },
};
