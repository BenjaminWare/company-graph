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
  const hasMounted = useRef(false)


  //Points to the div that wraps the graph svg
  const graphElement:any = useRef()
  //Holds the graph class reference including, addData, and removeData, this isn't state because its not the reactdom we change its the regular dom so everything is handled explicitly
  const graph:any = useRef()
  const readingDataLock:any = useRef(false)

  //On mount creates the graph with the static prop data
  useEffect(()=> {
    if(graphElement.current.childNodes.length == 0) {

    graph.current = new  Graph({"nodes":data.nodes,"links":data.links}, {    //@ts-ignore
      nodeId: d => d.id,    //@ts-ignore
      nodeTitle: d => `${d.id}`,
      nodeStroke:"#000",
      nodeStrokeWidth:0,    //@ts-ignore
      nodeRadius: d => d.market_cap ? 2* d.market_cap + 10: 30,    //@ts-ignore
      // onNodeClick:(e,d) => console.log(d), //first param is pointer event, second param is datas
      width:1400,
      height: 1000,
      invalidation: undefined// a promise to stop the simulation when the cell is re-run
    })
      graphElement.current.appendChild(graph.current.graph)

      graph.current.onNodeClicked = (e:any,d:any) => {
        console.log(e)
        //removes node that was clicked on
          graph.current.removeData([d],[])
      }
      hasMounted.current = true
  }
  },[])

  useEffect(()=>{
    if(hasMounted && !readingDataLock.current) {
      // Only let the data be read once, don't allow resets while reading
      readingDataLock.current = true 
      console.log('client fetch')
      console.log(graph.current.nodes)
      graph.current.removeData(graph.current.nodes,graph.current.links)
      console.log(graph.current.nodes)
      const fetchJSONData = async () => {
        //reads from the json folder in the public folder, users could navigate to this page if they wanted
        return await fetch(`../json/${dataFilename}`)
        .then((response) => response.json())
        .then((json) => {
          json.links.forEach((link:any,i:Number) => {link.id = Math.random()})
          graph.current.addData(json.nodes,json.links)
          //Un lock reader
          readingDataLock.current = false
        });
      }
      fetchJSONData().catch(() => {readingDataLock.current = false;console.error});

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
