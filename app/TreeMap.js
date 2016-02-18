class AgeStrategy {
    constructor() {
        this.domain = [0, 24];
    }

    getColor(d, parentColor, scale) {
        return d.children
            ? parentColor
            : scale(24 - (d.data['code-maat'] && d.data['code-maat'].ageMonths ? d.data['code-maat'].ageMonths : 24));
    }

}

class AuthorsStrategy {
    constructor() {
        this.domain = [0, 13];
    }

    getColor(d, parentColor, scale) {
        return d.children
            ? parentColor
            : scale(d.data['code-maat'] && d.data['code-maat'].nAuthors ? d.data['code-maat'].nAuthors : 0);
    }

}

export default class TreeMap {
    constructor() {
        this.w = 960;
        this.h = 700;
        this.paddingAllowance = 2;
        //this.color = d3.scale.category10();
        this.redish = d3.rgb("#E60D0D");
        this.blueish = d3.rgb("#0E34E0");
        this.parentStrokeColor = d3.rgb("#4E4545");
        this.parentFillColor = d3.rgb("#7D7E8C");

        this.colorRedToBlueLinearScale = d3.scale.linear()
            .range([this.redish, this.blueish]);
        this.darkerRedToBlueLinearScale = this.colorRedToBlueLinearScale
            .copy()
            .range([this.redish.darker(), this.blueish.darker()]);

        this.treemap = d3.layout.treemap()
            .size([this.w, this.h])
            .padding([20, 4, 4, 4])
            .value(d => d.data.cloc ? d.data.cloc.code : null);

    }

    //outputType can be "age" or "authors"
    render(outputType) {
        var self = this;

        outputType = outputType || "age";

        var strategy = outputType == "age"
            ? new AgeStrategy()
            : new AuthorsStrategy();

        var svg = d3.select("body").append("svg")
            .style("position", "relative")
            .style("width", `${this.w}px`)
            .style("height", `${this.h}px`)
            .append("g")
            .attr("transform", "translate(-.5,-.5)");

        var tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var getColor = strategy.getColor;
        this.setScalesBy(strategy);

        d3.json("/data/metrics.json", function(json) {
            var cell = svg.data([json]).selectAll("g")
                .data(self.treemap)
                .enter().append("g")
                .attr("class", "cell")
                .attr("transform", d => "translate(" + d.x + "," + d.y + ")");

            cell.on("mouseover", mouseover)
                .on("mouseout", mouseout);

            cell.append("rect")
                .attr("width", d => d.dx)
                .attr("height", d => d.dy)
                .style("fill", d => getCellFill(d))
                .style("stroke", d => getCellStroke(d))
                .style("z-index", d => -d.depth);

            cell.append("foreignObject")
                .attr("class", "foreignObject")
                .attr("width", d => Math.max(d.dx - self.paddingAllowance, 2))
                .attr("height", d => Math.max(d.dy - self.paddingAllowance, 2))
                .append("xhtml:body")
                .attr("class", "labelbody")
                .append("div")
                .attr("class", "label")
                .text(d => d.name)
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
                return getColor(d, self.parentStrokeColor, self.darkerRedToBlueLinearScale);
            }

            function getCellFill(d) {
                return getColor(d, self.parentFillColor, self.colorRedToBlueLinearScale);
            }
        });
    }

    setScalesBy(strategy) {
        this.colorRedToBlueLinearScale
            .domain(strategy.domain);
        this.darkerRedToBlueLinearScale
            .domain(strategy.domain);
    }
}

