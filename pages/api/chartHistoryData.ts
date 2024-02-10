'use server'
import { chartHistory } from '@/types/chartHistory';
import axios from 'axios';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';


    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
        console.log("Inside Chart History Handler")
    
        const api = axios.create({
            baseURL: 'http://173.249.49.52:18080',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': process.env.NEXT_PUBLIC_API_AUTH,
            },
          });
          console.log("Here is the query recieved for bars "+JSON.stringify(req.query))
          let { symbol, fromTs, toTs } = req.query;
          console.log("symbol "+symbol+" from "+ fromTs+" to "+toTs); 
          let from:number=Number(fromTs);
          let to:number=Number(toTs);
          const body = {
            "symbol": symbol as string,
           // "from":from,
            "to": to
          };
          console.log("Making Api Call")
          try {
                const response = await api.post('/charthistory',body);
                const data = await response.data;
                const total = await data.total;
                console.log('Here is the total count ' + total);
                const serverData: chartHistory[] = data.data;
                console.log("Here is the data "+serverData)
                res.status(200).json(response.data);
              } catch (error) {
                console.error('Error fetching chart history:', error);
                res.status(400).json("response.data");
              }
    }