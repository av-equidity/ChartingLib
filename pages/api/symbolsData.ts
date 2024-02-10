'use server'
import { symbols } from '@/types/symbols';
import axios from 'axios';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
        console.log("Inside Symbols  API Handler");
    
        const api = axios.create({
            baseURL: 'http://173.249.49.52:18080',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': process.env.NEXT_PUBLIC_API_AUTH,
            }
          });
          const dat = {
            token: process.env.NEXT_PUBLIC_API_TOKEN
          };
          console.log("Making Symbols Api Call")
          const response = await api.post("/symbols",dat);
          console.log("got the Symbol data"+ response.data)

          const serverData: symbols[] = [];
          
          for (const [key, value] of Object.entries(response.data)) {
             (value as symbols[]).forEach(item => {
                    serverData.push(item);
                  });
            }
          console.log("got symbol data "+ JSON.stringify(serverData[0]))
          res.status(200).json(serverData)
    }