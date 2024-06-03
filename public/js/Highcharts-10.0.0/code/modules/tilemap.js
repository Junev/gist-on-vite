/*
 Highmaps JS v10.0.0 (2022-03-07)

 Tilemap module

 (c) 2010-2021 Highsoft AS

 License: www.highcharts.com/license
*/
(function(a){"object"===typeof module&&module.exports?(a["default"]=a,module.exports=a):"function"===typeof define&&define.amd?define("highcharts/modules/tilemap",["highcharts","highcharts/modules/map"],function(k){a(k);a.Highcharts=k;return a}):a("undefined"!==typeof Highcharts?Highcharts:void 0)})(function(a){function k(a,d,h,g){a.hasOwnProperty(d)||(a[d]=g.apply(null,h),"function"===typeof CustomEvent&&window.dispatchEvent(new CustomEvent("HighchartsModuleLoaded",{detail:{path:d,module:a[d]}})))}
a=a?a._modules:{};k(a,"Series/Tilemap/TilemapPoint.js",[a["Core/Axis/Color/ColorAxisComposition.js"],a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,d,h){var g=this&&this.__extends||function(){var a=function(e,d){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,c){b.__proto__=c}||function(b,c){for(var a in c)c.hasOwnProperty(a)&&(b[a]=c[a])};return a(e,d)};return function(e,d){function b(){this.constructor=e}a(e,d);e.prototype=null===d?Object.create(d):(b.prototype=
d.prototype,new b)}}(),f=d.series.prototype.pointClass;h=h.extend;d=function(a){function e(){var e=null!==a&&a.apply(this,arguments)||this;e.options=void 0;e.radius=void 0;e.series=void 0;e.tileEdges=void 0;return e}g(e,a);e.prototype.haloPath=function(){return this.series.tileShape.haloPath.apply(this,arguments)};return e}(d.seriesTypes.heatmap.prototype.pointClass);h(d.prototype,{setState:f.prototype.setState,setVisible:a.pointSetVisible});return d});k(a,"Series/Tilemap/TilemapShapes.js",[a["Core/Globals.js"],
a["Core/Series/SeriesRegistry.js"],a["Core/Utilities.js"]],function(a,d,h){function g(b,c,a){b=b.options;return{xPad:(b.colsize||1)/-c,yPad:(b.rowsize||1)/-a}}d=d.seriesTypes;var f=d.heatmap,t=d.scatter,e=h.clamp,k=h.pick;return{hexagon:{alignDataLabel:t.prototype.alignDataLabel,getSeriesPadding:function(b){return g(b,3,2)},haloPath:function(b){if(!b)return[];var c=this.tileEdges;return[["M",c.x2-b,c.y1+b],["L",c.x3+b,c.y1+b],["L",c.x4+1.5*b,c.y2],["L",c.x3+b,c.y3-b],["L",c.x2-b,c.y3-b],["L",c.x1-
1.5*b,c.y2],["Z"]]},translate:function(){var b=this.options,c=this.xAxis,a=this.yAxis,d=b.pointPadding||0,r=(b.colsize||1)/3,w=(b.rowsize||1)/2,n;this.generatePoints();this.points.forEach(function(b){var p=e(Math.floor(c.len-c.translate(b.x-2*r,0,1,0,1)),-c.len,2*c.len),h=e(Math.floor(c.len-c.translate(b.x-r,0,1,0,1)),-c.len,2*c.len),v=e(Math.floor(c.len-c.translate(b.x+r,0,1,0,1)),-c.len,2*c.len),u=e(Math.floor(c.len-c.translate(b.x+2*r,0,1,0,1)),-c.len,2*c.len),x=e(Math.floor(a.translate(b.y-w,
0,1,0,1)),-a.len,2*a.len),q=e(Math.floor(a.translate(b.y,0,1,0,1)),-a.len,2*a.len),l=e(Math.floor(a.translate(b.y+w,0,1,0,1)),-a.len,2*a.len),m=k(b.pointPadding,d),f=m*Math.abs(h-p)/Math.abs(l-q);f=c.reversed?-f:f;var g=c.reversed?-m:m;m=a.reversed?-m:m;b.x%2&&(n=n||Math.round(Math.abs(l-x)/2)*(a.reversed?-1:1),x+=n,q+=n,l+=n);b.plotX=b.clientX=(h+v)/2;b.plotY=q;p+=f+g;h+=g;v-=g;u-=f+g;x-=m;l+=m;b.tileEdges={x1:p,x2:h,x3:v,x4:u,y1:x,y2:q,y3:l};b.shapeType="path";b.shapeArgs={d:[["M",h,x],["L",v,x],
["L",u,q],["L",v,l],["L",h,l],["L",p,q],["Z"]]}});this.translateColors()}},diamond:{alignDataLabel:t.prototype.alignDataLabel,getSeriesPadding:function(b){return g(b,2,2)},haloPath:function(b){if(!b)return[];var c=this.tileEdges;return[["M",c.x2,c.y1+b],["L",c.x3+b,c.y2],["L",c.x2,c.y3-b],["L",c.x1-b,c.y2],["Z"]]},translate:function(){var b=this.options,c=this.xAxis,a=this.yAxis,d=b.pointPadding||0,h=b.colsize||1,w=(b.rowsize||1)/2,n;this.generatePoints();this.points.forEach(function(b){var f=e(Math.round(c.len-
c.translate(b.x-h,0,1,0,0)),-c.len,2*c.len),r=e(Math.round(c.len-c.translate(b.x,0,1,0,0)),-c.len,2*c.len),p=e(Math.round(c.len-c.translate(b.x+h,0,1,0,0)),-c.len,2*c.len),u=e(Math.round(a.translate(b.y-w,0,1,0,0)),-a.len,2*a.len),g=e(Math.round(a.translate(b.y,0,1,0,0)),-a.len,2*a.len),q=e(Math.round(a.translate(b.y+w,0,1,0,0)),-a.len,2*a.len),l=k(b.pointPadding,d),m=l*Math.abs(r-f)/Math.abs(q-g);m=c.reversed?-m:m;l=a.reversed?-l:l;b.x%2&&(n=Math.abs(q-u)/2*(a.reversed?-1:1),u+=n,g+=n,q+=n);b.plotX=
b.clientX=r;b.plotY=g;f+=m;p-=m;u-=l;q+=l;b.tileEdges={x1:f,x2:r,x3:p,y1:u,y2:g,y3:q};b.shapeType="path";b.shapeArgs={d:[["M",r,u],["L",p,g],["L",r,q],["L",f,g],["Z"]]}});this.translateColors()}},circle:{alignDataLabel:t.prototype.alignDataLabel,getSeriesPadding:function(b){return g(b,2,2)},haloPath:function(b){return t.prototype.pointClass.prototype.haloPath.call(this,b+(b&&this.radius))},translate:function(){var b=this.options,a=this.xAxis,d=this.yAxis,h=b.pointPadding||0,r=(b.rowsize||1)/2,w=b.colsize||
1,n,g,f,t,k=!1;this.generatePoints();this.points.forEach(function(b){var c=e(Math.round(a.len-a.translate(b.x,0,1,0,0)),-a.len,2*a.len),p=e(Math.round(d.translate(b.y,0,1,0,0)),-d.len,2*d.len),l=h,m=!1;"undefined"!==typeof b.pointPadding&&(l=b.pointPadding,k=m=!0);if(!t||k)n=Math.abs(e(Math.floor(a.len-a.translate(b.x+w,0,1,0,0)),-a.len,2*a.len)-c),g=Math.abs(e(Math.floor(d.translate(b.y+r,0,1,0,0)),-d.len,2*d.len)-p),f=Math.floor(Math.sqrt(n*n+g*g)/2),t=Math.min(n,f,g)-l,k&&!m&&(k=!1);b.x%2&&(p+=
g*(d.reversed?-1:1));b.plotX=b.clientX=c;b.plotY=p;b.radius=t;b.shapeType="circle";b.shapeArgs={x:c,y:p,r:t}});this.translateColors()}},square:{alignDataLabel:f.prototype.alignDataLabel,translate:f.prototype.translate,getSeriesPadding:a.noop,haloPath:f.prototype.pointClass.prototype.haloPath}}});k(a,"Series/Tilemap/TilemapComposition.js",[a["Core/Axis/Axis.js"],a["Core/Utilities.js"]],function(a,d){d=d.addEvent;d(a,"afterSetAxisTranslation",function(){if(!this.recomputingForTilemap&&"colorAxis"!==
this.coll){var a=this,d=a.series.map(function(d){return d.getSeriesPixelPadding&&d.getSeriesPixelPadding(a)}).reduce(function(a,d){return(a&&a.padding)>(d&&d.padding)?a:d},void 0)||{padding:0,axisLengthFactor:1},f=Math.round(d.padding*d.axisLengthFactor);d.padding&&(a.len-=f,a.recomputingForTilemap=!0,a.setAxisTranslation(),delete a.recomputingForTilemap,a.minPixelPadding+=d.padding,a.len+=f)}})});k(a,"Series/Tilemap/TilemapSeries.js",[a["Core/Globals.js"],a["Core/Series/SeriesRegistry.js"],a["Series/Tilemap/TilemapPoint.js"],
a["Series/Tilemap/TilemapShapes.js"],a["Core/Utilities.js"]],function(a,d,h,g,f){var k=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};return a(b,c)};return function(b,c){function d(){this.constructor=b}a(b,c);b.prototype=null===c?Object.create(c):(d.prototype=c.prototype,new d)}}();a=a.noop;var e=d.seriesTypes,y=e.column,b=e.heatmap;e=e.scatter;
var c=f.extend,v=f.merge;f=function(a){function c(){var b=null!==a&&a.apply(this,arguments)||this;b.data=void 0;b.options=void 0;b.points=void 0;b.tileShape=void 0;return b}k(c,a);c.prototype.alignDataLabel=function(){return this.tileShape.alignDataLabel.apply(this,Array.prototype.slice.call(arguments))};c.prototype.drawPoints=function(){var a=this;y.prototype.drawPoints.call(this);this.points.forEach(function(b){b.graphic&&b.graphic[a.chart.styledMode?"css":"animate"](a.colorAttribs(b))})};c.prototype.getSeriesPixelPadding=
function(a){var b=a.isXAxis,c=this.tileShape.getSeriesPadding(this);if(!c)return{padding:0,axisLengthFactor:1};var d=Math.round(a.translate(b?2*c.xPad:c.yPad,0,1,0,1));a=Math.round(a.translate(b?c.xPad:0,0,1,0,1));return{padding:Math.abs(d-a)||0,axisLengthFactor:b?2:1.1}};c.prototype.setOptions=function(){var b=a.prototype.setOptions.apply(this,Array.prototype.slice.call(arguments));this.tileShape=g[b.tileShape];return b};c.prototype.translate=function(){return this.tileShape.translate.apply(this,
Array.prototype.slice.call(arguments))};c.defaultOptions=v(b.defaultOptions,{marker:null,states:{hover:{halo:{enabled:!0,size:2,opacity:.5,attributes:{zIndex:3}}}},pointPadding:2,tileShape:"hexagon"});return c}(b);c(f.prototype,{getSymbol:a,markerAttribs:e.prototype.markerAttribs,pointAttribs:y.prototype.pointAttribs,pointClass:h});d.registerSeriesType("tilemap",f);"";"";return f});k(a,"masters/modules/tilemap.src.js",[],function(){})});
//# sourceMappingURL=tilemap.js.map