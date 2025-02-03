function initializeVisualization() {
    const { nodes, links } = window.dataflow;
    
    const width = 3000, height = 1200;
    const svg = d3.select("#dataflow-svg")
        .attr("width", width)
        .attr("height", height)
        .style("overflow-x", "auto");
    
    const linkGroup = svg.append("g").attr("class", "links");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    d3.select("body").append("div")
        .attr("class", "scroll-container")
        .style("width", "100%")
        .style("overflow-x", "auto")
        .style("white-space", "nowrap")
        .append("div")
        .attr("id", "scroll-content")
        .style("width", width + "px")
        .append(() => svg.node());

    const nodeDepth = {};
    const visitedNodes = new Set();
    const depthCount = {};

    function calculateDepth(node, depth = 0) {
        if (visitedNodes.has(node.id)) {
            return;
        }
        visitedNodes.add(node.id);

        if (nodeDepth[node.id] === undefined || depth > nodeDepth[node.id]) {
            nodeDepth[node.id] = depth;
        }
        node.downstreamNodes.forEach(downstream => {
            if (downstream !== "") {
                const downstreamNode = nodes.find(n => n.id === downstream);
                if (downstreamNode) {
                    calculateDepth(downstreamNode, depth + 1);
                }
            }
        });
    }
    
    const sourceNodes = nodes.filter(n => n.upstreamNodes.length === 0);
    sourceNodes.forEach(sourceNode => calculateDepth(sourceNode));
    
    nodes.forEach(node => {
        const depth = nodeDepth[node.id] || 0;
        if (!depthCount[depth]) {
            depthCount[depth] = 0;
        }
        node.x = 150 + depth * 350;
        node.y = 150 + depthCount[depth] * 180;
        depthCount[depth] += 1;
        node.dependenciesResolved = 0;
    });

    const newLinks = [];
    nodes.forEach(node => {
        node.upstreamNodes.forEach(upstream => {
            newLinks.push({ source: upstream, target: node.id });
        });
    });

    links.push(...newLinks);

    links.sort((a, b) => {
        const depthA = nodeDepth[a.source] || 0;
        const depthB = nodeDepth[b.source] || 0;
        return depthA - depthB;
    });

    function animateLinks(index = 0) {
        if (index >= links.length) return;
        
        const link = links[index];
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return;
        
        const path = d3.line()
            .curve(d3.curveBasis)([
                [sourceNode.x + 170, sourceNode.y + 30],
                [sourceNode.x + 300, sourceNode.y + 30],
                [targetNode.x - 250, targetNode.y + 30],
                [targetNode.x, targetNode.y + 30]
            ]);
        
        const linkPath = linkGroup.append("path")
            .datum(link)
            .attr("class", "link")
            .attr("stroke", "#333")
            .attr("stroke-width", "12px")
            .attr("fill", "none")
            .attr("stroke-linecap", "round")
            .style("stroke-opacity", 1)
            .attr("d", path)
            .attr("marker-end", "url(#arrow)");
        
        const totalLength = linkPath.node().getTotalLength();
        linkPath.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .delay(index * 100)
            .duration(100)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .on("end", () => {
                targetNode.dependenciesResolved++;
                if (targetNode.dependenciesResolved >= targetNode.upstreamNodes.length) {
                    d3.select(`#node-${targetNode.id}`)
                        .transition()
                        .duration(100)
                        .style("fill", "green")
                        .style("color", "white");
                }
                animateLinks(index + 1);
            });
    }

    svg.append("defs").append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 12)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .style("fill", "#333");
    
    animateLinks();

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("border", "1px solid black")
        .style("padding", "5px");

    nodeGroup.selectAll("rect")
        .data(nodes)
        .enter().append("rect")
        .attr("class", "node")
        .attr("id", d => `node-${d.id}`)
        .attr("width", 220)
        .attr("height", 70)
        .attr("rx", 15)
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .style("fill", d => d.upstreamNodes.length === 0 ? "green" : "yellow")
        .style("stroke", "#000")
        .style("stroke-width", "3px")
        .on("mouseover", function (event, d) {
            if (d.id === "SLS_DETAILS") {
                tooltip.html(
                    `<strong>Partitions Inserted:</strong><br>` +
                    `sls_summary_prd1 = 51<br>` +
                    `sls_details_prd1 = 51<br>` +
                    `sls_details_intercompany_indi_prd1 = 51`
                )
                .style("visibility", "visible")
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            }
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    nodeGroup.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("x", d => d.x + 110)
        .attr("y", d => d.y + 40)
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "14px")
        .text(d => d.name);
}
