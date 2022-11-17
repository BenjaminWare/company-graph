 import * as d3 from "d3"
 
 export default class Graph {
    constructor({nodes,links},{
    graphName = "", //used with the ids only matters when multiple of the graph are used
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 5, // node radius, in pixels
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkDistance = d => 75 * (1 -d.value) + 25,
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    onNodeClick, //event handler for node being clicked
    } = {}) {
      //Params needed outside of constructor
      this.linkDistance = linkDistance
      this.nodeRadius = nodeRadius
      this.nodeFill = nodeFill
      this.graphName = graphName
      //EVENT HANLDERS TO BE SET BY USER
      //when a node is clicked (e,d) e = event, d = data, so if msft node is clicked d is {'id':MSFT,...}
      this.onNodeClicked = onNodeClick
      //Data
      this.nodes = nodes
      this.links = links
      //Wrapper HTML Elements
      this.svg = d3.create("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [-width / 2, -height / 2, width, height])
          .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
      
      this.graph = this.svg.node()
  
  
      this.linkWrapper = this.svg.append("g")
        .attr("stroke", linkStroke)
        .attr("stroke-opacity", linkStrokeOpacity)
        .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
        .attr("stroke-linecap", linkStrokeLinecap)
  
      this.nodeWrapper = this.svg.append("g")
          .attr("fill", nodeFill)
          .attr("stroke", nodeStroke)
          .attr("stroke-opacity", nodeStrokeOpacity)
          .attr("stroke-width", nodeStrokeWidth)
  
      
      
      //Simulation initialized
      //create link force to drive simulation
      const N = d3.map(nodes, d => d.id)
      const forceLink = d3.forceLink(this.links).id(({index: i}) => N[i]).distance(this.linkDistance)
  
      this.simulation = d3.forceSimulation(this.nodes)
              .force("charge", d3.forceManyBody().strength(-300))
              .force("link",forceLink)
              .force("x", d3.forceX())
              .force("y", d3.forceY())
              .force("collision",d3.forceCollide(d => this.nodeRadius(d)))
      
      this.update()
      
      //TODO could be zoom in zoom out
  
  
    }
  
    //Given array of nodes and links, adds unique nodes and links to simulation
    addData(newNodes,newLinks) {
      //removes dupes from params
      newNodes = Array.from(new Set(newNodes))
      newLinks = Array.from(new Set(newLinks))
  
      //adds unique nodes and links
      this.links.push(...(newLinks.filter((link) => this.links.indexOf(link) === -1)))
      this.nodes.push(...(newNodes.filter((node) => this.nodes.indexOf(node) === -1)))
      
      //updates svg
      this.update()
    }

    removeData(oldNodes,oldLinks) {
      //removes nodes
      this.links = this.links.filter(link => !oldLinks.some(oldLink => oldLink.id === link.id))
      this.nodes = this.nodes.filter(node => !oldNodes.some(oldNode => oldNode.id === node.id))
      //updates svg
      this.update()
    }
  
  
    //update function to be called when changing nodes and links
    update = () => {
      const N = d3.map(this.nodes, d => d.id)
  
      const forceLink = d3.forceLink(this.links).id(({index: i}) => N[i]).distance(this.linkDistance)
      //Kind of a slow implementation, TODO remove links that are related to a node that got dropped
      this.links = this.links.filter((link) => (N.includes(link.source) ||  N.includes(link.source.id)) && (N.includes(link.target) || N.includes(link.target.id)))
  
  
      //changes link html elements
      let link = this.linkWrapper.selectAll("line")
            .data(this.links,link => link.id)
            .join("line");
      //changes node html elements
      let node = this.nodeWrapper.selectAll("g")
        .data(this.nodes, node => node.id)
        .join(
        enter => enter
          .append("g") //appends group to be moved around
          // .append('text').text(d => d.id)
          .append("image") //appends and styles image of company logo
          .attr("mask","url(#icon-mask)")
          .attr("xlink:href",(d) => `./ticker_icons/${d.id.toLocaleLowerCase()}.png`)
          .attr("x",d => -this.nodeRadius(d)).attr("y",d => -this.nodeRadius(d))
          .attr("height",d => 2*this.nodeRadius(d))
          .attr("width",d => 2*this.nodeRadius(d)) 
          .on("click",(e,d) => this.onNodeClicked ? this.onNodeClicked(e,d) : null) //If an event handler is specified use it otherwise do nothing
          .select(function() {
            return this.parentNode; //makes sure node returns to the g tag, not the image tag so the image is what gets moved
          }),
        )
        .attr("id",(d,i) => this.graphName + "group" + i)
        .call(drag(this.simulation))
  
  
      //create link force to drive simulation
      this.simulation.nodes(this.nodes).force("link",forceLink).on("tick", ticked).alphaTarget(0.3).restart();
      //Drag part of the sim
      function drag(simulation) {    
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    } 
      //What to do on tick
      function ticked() {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
  
  
        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      }
      }
  
  }
  