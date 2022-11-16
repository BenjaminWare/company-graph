import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import path from 'path';
import {promises as fs} from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import Graph from '../models/Graph'
import { useEffect } from 'react';
export async function getStaticProps(context: any) {
  const jsonDirectory = path.join(process.cwd(),'json');
  const fileName = 'upsTree2.json'
  const fileContents = await fs.readFile(jsonDirectory + "/" + fileName,'utf-8');
  const data = JSON.parse(fileContents)
  return {props: {data}}
}
export default function Home({data}:any) {
  console.log(typeof(data))
  const {nodes,links} = data
  useEffect(()=> {
    //@ts-ignore
    const graph = new  Graph({"nodes":data.nodes,"links":data.links}, {    //@ts-ignore
      nodeId: d => d.id,    //@ts-ignore
      nodeTitle: d => `${d.id}`,
      nodeStroke:"#000",
      nodeStrokeWidth:0,    //@ts-ignore
      nodeRadius: d => d.market_cap ? 2* d.market_cap + 10: 30,    //@ts-ignore
      onNodeClick:(e,d) => whenNodeClicked(d), //first param is pointer event, second param is datas
      width:1400,
      height: 1000,
      invalidation: undefined// a promise to stop the simulation when the cell is re-run
    })
    document.body.appendChild(graph.graph)
  },[])
  return (
    <div className={styles.container}>
      <Image width='50' height='50' src='/ticker_icons/a.png' alt={''}></Image>
    </div>
  )
}
