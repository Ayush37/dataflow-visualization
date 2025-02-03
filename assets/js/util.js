function getStatusColor(status) {
    switch (status) {
        case "not_started": return "#cccccc";
        case "in_progress": return "#f4a742";
        case "completed": return "#4caf50";
        default: return "#cccccc";
    }
}

function addTooltips() {
    d3.selectAll(".node").on("mouseover", function(event, d) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px")
            .style("display", "block")
            .html(`<strong>${d.name}</strong><br>Status: ${d.status}`);
    }).on("mouseout", function() {
        d3.select("#tooltip").style("display", "none");
    });
}
