import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import path from 'path';
import {promises as fs} from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import Graph from '../models/Graph'
import { useEffect, useRef, useState } from 'react';

//default dataset, reads from json folder, which is "safe" because it isn't exposed client side
export async function getStaticProps(context: any) {

  const jsonDirectory = path.join(process.cwd(),'json');
  const fileName = 'upsTree2.json'
  const fileContents = await fs.readFile(jsonDirectory + "/" + fileName,'utf-8');
  const data = JSON.parse(fileContents)
  return {props: {data}}
}
export default function Home({data}:any) {

  const [dataFilename,setDataFilename] = useState("upsTree2.json")
  const [graphSetup, setGraphSetup] = useState(false)


  //Points to the div that wraps the graph svg
  const graphElement:any = useRef()
  //Holds the graph class reference including, addData, and removeData, this isn't state because its not the reactdom we change its the regular dom so everything is handled explicitly
  const graph:any = useRef()
  const {nodes,links} = data
  useEffect(()=> {
    if(graphElement.current.childNodes.length == 0) {
    const whenNodeClicked = (d:any) => {
        console.log(d);
    } 
    graph.current = new  Graph({"nodes":data.nodes,"links":data.links}, {    //@ts-ignore
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
      graphElement.current.appendChild(graph.current.graph)
      setGraphSetup(true) //TODO is this deterministic as a way to prevent changes to the selector effecting the graph onload
  }
  },[])
  useEffect(()=>{
    if(graphSetup) {
      graph.current.removeData(graph.current.nodes,graph.current.links)
      const fetchJSONData = async () => {
        //reads from the json folder in the public folder, users could navigate to this page if they wanted
        return await fetch(`../json/${dataFilename}`)
        .then((response) => response.json())
        .then((json) => {
          graph.current.addData(json.nodes,json.links)
        });
      }
      fetchJSONData().catch(console.error);

    }
  },[dataFilename])
  return (
    <div className={styles.container}>
      <select value={dataFilename} onChange={(e=> setDataFilename(e.target.value))} name="data" id="data">
        <option value="sample.json">Sample</option>
        <option value="upsTree2.json">UPS</option>
        <option value="S&Pdata.json">S&P500</option>
      </select>
      <div ref={graphElement}/>
    </div>
  )
}
