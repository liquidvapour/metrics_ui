import d3 from 'd3';  // seems we have to do this once?
import {TreeMap, GetLanguageStokeColor, BuildGetLanguageFillColor, BuildGetAgeColor, BuildGetAuthorsColor, BuildGetJsComplexityColor}  from './TreeMap.js';

window.treemap = new TreeMap();
//window.treemap.render(BuildGetLanguageFillColor(), GetLanguageStokeColor);
const max = 24;

var redish = d3.rgb("#E60D0D");
var blueish = d3.rgb("#0E34E0");

var colorRedToBlueLinearScale = d3.scale.linear()
    .range([redish, blueish])
    .domain([0, max]);
    
var darkerRedToBlueLinearScale = colorRedToBlueLinearScale
    .copy()
    .range([redish.darker(), blueish.darker()]);

window.treemap.render(BuildGetAgeColor(colorRedToBlueLinearScale, max), BuildGetAgeColor(darkerRedToBlueLinearScale, max));
//window.treemap.render(BuildGetAuthorsColor(colorRedToBlueLinearScale), BuildGetAuthorsColor(darkerRedToBlueLinearScale));

const nutralColor = d3.rgb('green');
// window.treemap.render(
//     BuildGetJsComplexityColor(colorRedToBlueLinearScale, nutralColor, max), 
//     BuildGetJsComplexityColor(darkerRedToBlueLinearScale, nutralColor.darker(), max));


