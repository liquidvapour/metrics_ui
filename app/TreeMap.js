export default class TreeMap {
    constructor() {
        var w = 960;
        var h = 700;
        var paddingAllowance = 2;
        //var color = d3.scale.category10();
        var redish = d3.rgb("#E60D0D");
        var blueish = d3.rgb("#0E34E0");
        var colorRedToBlueLinearScale = d3.scale.linear()
            .domain([0, 13])
            .range([redish, blueish])
        var darkerRedToBlueLinearScale = colorRedToBlueLinearScale
            .copy()
            .range([redish.darker(), blueish.darker()]);

        var treemap = d3.layout.treemap()
            .size([w, h])
            .padding([20, 4, 4, 4])
            .value(d => d.data.cloc ? d.data.cloc.code : null);

        var svg = d3.select("body").append("svg")
            .style("position", "relative")
            .style("width", `${w}px`)
            .style("height", `${h}px`)
            .append("g")
            .attr("transform", "translate(-.5,-.5)");

        var tooltip = d3.select("body").append("div") .attr("class", "tooltip") .style("opacity", 0);

        d3.json("/data/metrics.json", function(json) {
            var cell = svg.data([json]).selectAll("g")
                .data(treemap)
                .enter().append("g")
                .attr("class", "cell")
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            cell.on("mouseover", mouseover)
                .on("mouseout", mouseout);

            cell.append("rect")
                .attr("width", function(d) { return d.dx; })
                .attr("height", function(d) { return d.dy; })
                .style("fill", function(d) { return getCellFill(d); })
                .style("stroke", function(d) { return getCellStroke(d); })
                .style("z-index", function(d) { return -d.depth; });

            cell.append("foreignObject")
                .attr("class", "foreignObject")
                .attr("width", function(d) {
                    return Math.max(d.dx - paddingAllowance, 2);
                })
                .attr("height", function(d) {
                    return Math.max(d.dy - paddingAllowance, 2);
                })
                .append("xhtml:body")
                .attr("class", "labelbody")
                .append("div")
                .attr("class", "label")
                .text(function(d) {
                    return d.name;
                })
                .attr("text-anchor", "middle");

            function formatTooltip(d) {
                return `${d.name}<pre>${JSON.stringify(d.data, null, 2)}</pre>`
            }

            function mouseover(d) {
                const text = Object.keys(d.data).map(key => `${key}:${d.data[key]}`).join("<br/>");
                tooltip.transition()
                    .duration(200);
                tooltip
                    .style("opacity", 0.9);
                tooltip.html(formatTooltip(d))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
            }

            function mouseout(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            }

            function getCellStroke(d) {
                return d.children
                    ? "#4E4545"
                    : darkerRedToBlueLinearScale(d.data['code-maat'] && d.data['code-maat'].nAuthors ? d.data['code-maat'].nAuthors : 0);
            }

            function getCellFill(d) {
                return d.children
                    ? "#7D7E8C"
                    : colorRedToBlueLinearScale(d.data['code-maat'] && d.data['code-maat'].nAuthors ? d.data['code-maat'].nAuthors : 0);
            }

        });
    }
}

