﻿/*
 Highcharts JS v8.0.4 (2020-03-10)

 (c) 2010-2019 Highsoft AS
 Author: Sebastian Domas

 License: www.highcharts.com/license
*/
(
    function (a) {
        "object" === typeof module && module.exports ? (a["default"] = a, module.exports = a) : "function" === typeof define && define.amd ? define("highcharts/modules/histogram-bellcurve", ["highcharts"],
            function (b) {
                a(b);
                a.Highcharts = b;
                return a
            }) : a("undefined" !== typeof Highcharts ? Highcharts : void 0)
    }
)
    (
    function (a) {
        function b(g, a, f, b) {
            g.hasOwnProperty(a) || (g[a] = b.apply(null, f))
        } a = a ? a._modules : {};
        b(a, "mixins/derived-series.js", [a["parts/Globals.js"], a["parts/Utilities.js"]], function (a, b) {
            var g = b.addEvent, p = b.defined, l = a.Series;
            return {
                hasDerivedData: !0, init: function () {
                    l.prototype.init.apply(this, arguments); this.initialised = !1; this.baseSeries = null; this.eventRemovers = []; this.addEvents()
                },
                setDerivedData: a.noop,
                setBaseSeries: function () {
                    var d = this.chart, a = this.options.baseSeries;
                    this.baseSeries = p(a) && (d.series[a] || d.get(a)) || null
                },
                addEvents: function () {
                    var a = this;
                    var b = g(this.chart, "afterLinkSeries", function () {
                        a.setBaseSeries();
                        a.baseSeries && !a.initialised && (a.setDerivedData(), a.addBaseSeriesEvents(), a.initialised = !0)
                    }); this.eventRemovers.push(b)
                },
                addBaseSeriesEvents: function () {
                    var a = this;
                    var b = g(a.baseSeries, "updatedData", function () {
                        a.setDerivedData()
                    });
                    var f = g(a.baseSeries, "destroy", function () {
                        a.baseSeries = null; a.initialised = !1
                    });
                    a.eventRemovers.push(b, f)
                },
                destroy: function () {
                    this.eventRemovers.forEach(function (a) {
                        a()
                    });
                    l.prototype.destroy.apply(this, arguments)
                }
            }
        });
        b(a, "modules/histogram.src.js", [a["parts/Utilities.js"], a["mixins/derived-series.js"]], function (a, b) {
            function g(a) {
                return function (c) {
                    for (var e = 1; a[e] <= c;)
                        e++;
                    return a[--e]
                }
            }

            var p = a.arrayMax, l = a.arrayMin, d = a.correctFloat, m = a.isNumber, k = a.merge, r = a.objectEach; a = a.seriesType;
            var h = {
                "square-root": function (a) {
                    return Math.ceil(Math.sqrt(a.options.data.length))
                },
                sturges: function (a) {
                    return Math.ceil(Math.log(a.options.data.length) * Math.LOG2E)
                },
                rice: function (a) {
                    return Math.ceil(2 * Math.pow(a.options.data.length, 1 / 3))
                }
            };
            a("histogram", "column", {
                binsNumber: "square-root",
                binWidth: void 0,
                pointPadding: 0,
                groupPadding: 0,
                grouping: !1,
                pointPlacement: "between",
                tooltip: {
                    headerFormat: "",
                    pointFormat: '<span style="font-size: 10px">{point.x} - {point.x2}</span><br/><span style="color:{point.color}">\u25cf</span> {series.name} <b>{point.y}</b><br/>'
                }
            },
                k(b, {
                    setDerivedData: function () {
                        var a = this.baseSeries.yData;
                        a.length && (a = this.derivedData(a, this.binsNumber(), this.options.binWidth), this.setData(a, !1))
                    },
                    derivedData: function (a, e, b) {
                        var c = p(a), h = d(l(a)), n = [], f = {}, k = [];
                        b = this.binWidth = this.options.pointRange = d(m(b) ? b || 1 : (c - h) / 10 /*e*/);    // (c - h) / 10-- -（最大值 - 最小值）/10等分
                        for (e = h; e < c && (this.userOptions.binWidth || d(c - e) >= b || 0 >= d(h + n.length * b - e)); e = d(e + b))
                            n.push(e), f[e] = 0;
                        0 !== f[h] && (n.push(d(h)), f[d(h)] = 0);
                        var q = g(n.map(function (a) {
                            return parseFloat(a)
                        }));
                        a.forEach(function (a) {
                            a = d(q(a)); f[a]++
                        });
                        r(f, function (a, c) {
                            k.push({
                                x: Number(c),
                                y: a,
                                x2: d(Number(c) + b)
                            })
                        });
                        k.sort(function (a, c) {
                            return a.x - c.x
                        });
                        return k
                    },
                    binsNumber: function () {
                        var a = this.options.binsNumber, b = h[a] || "function" === typeof a && a;
                        return Math.ceil(b && b(this.baseSeries) || (m(a) ? a : h["square-root"](this.baseSeries)))
                    }
                })); ""
        });
        b(a, "modules/bellcurve.src.js",
            [a["parts/Utilities.js"], a["mixins/derived-series.js"]], function (a, b) {
                function f(a) {
                    var b = a.length;
                    a = a.reduce(function (a, b) {
                        return a + b
                    }, 0);
                    return 0 < b && a / b
                }
                function g(a, b) {
                    var c = a.length;
                    b = m(b) ? b : f(a);
                    a = a.reduce(function (a, c) {
                        c -= b;
                        return a + c * c
                    }, 0);
                    return 1 < c && Math.sqrt(a / (c - 1))
                }
                function l(a, b, c) {
                    a -= b;
                    return Math.exp(-(a * a) / (2 * c * c)) / (c * Math.sqrt(2 * Math.PI))
                }
                var d = a.correctFloat, m = a.isNumber, k = a.merge;
                a = a.seriesType;
                a("bellcurve", "areaspline", {
                    intervals: 3,
                    pointsInInterval: 3,
                    marker: {
                        enabled: !1
                    }
                },
                    k(b, {
                        setMean: function () {
                            this.mean = d(f(this.baseSeries.yData))
                        },
                        setStandardDeviation: function () {
                            this.standardDeviation = d(g(this.baseSeries.yData, this.mean))
                        },
                        setDerivedData: function () {
                            1 < this.baseSeries.yData.length && (this.setMean(),
                                this.setStandardDeviation(),
                                this.setData(this.derivedData(this.mean, this.standardDeviation), !1))
                        },
                        derivedData: function (a, b) {
                            var c = this.options.intervals, e = this.options.pointsInInterval, d = a - c * b; c = c * e * 2 + 1;
                            e = b / e;
                            var f = [], g;
                            for (g = 0; g < c; g++)
                                f.push([d, l(d, a, b)]),
                                    d += e;
                            return f
                        }
                    }));
                ""
            }
        );
        b(a, "masters/modules/histogram-bellcurve.src.js", [], function () { })
    });
//# sourceMappingURL=histogram-bellcurve.js.map