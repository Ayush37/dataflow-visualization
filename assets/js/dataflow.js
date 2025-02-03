document.addEventListener("DOMContentLoaded", function() {
    d3.json("data/dataflow.json").then(function(data) {
        processData(data);
    }).catch(function(error) {
        console.error("Error loading dataflow JSON:", error);
    });
});

function processData(data) {
    const nodes = [];
    const links = [];

    data.categories.forEach(category => {
        category.stages.forEach(stage => {
            nodes.push({
                id: stage.id,
                name: stage.name,
                status: stage.status,
                upstreamNodes: stage.upstreamNodes,
                downstreamNodes: stage.downstreamNodes
            });

            stage.downstreamNodes.forEach(downstream => {
                links.push({ source: stage.id, target: downstream });
            });
        });
    });
    
    window.dataflow = { nodes, links };
    initializeVisualization();
}
