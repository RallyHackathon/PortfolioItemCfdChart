(function () {

    Ext.define('Rally.app.analytics.CfdChartConfigBuilder', {

        build:function (requestedQuery, chartTitle, buildFinishedCallback) {
            this.chartTitle = chartTitle;
            this.buildFinishedCallback = buildFinishedCallback;
            this.query = {
                find:Ext.encode(requestedQuery.find),
                pagesize:10000
            };
            this.requestedFields = Ext.Array.union(['_ValidFrom', '_ValidTo', 'ObjectID', 'ScheduleState', 'PlanEstimate'], requestedQuery.fields ? requestedQuery.fields : []);

            this.workspace = Rally.util.Ref.getOidFromRef(Rally.environment.getContext().context.scope.workspace._ref);

            this._queryAnalyticsApi();

        },

        _queryAnalyticsApi:function () {
            Ext.Ajax.request({
                url:"https://rally1.rallydev.com/analytics/1.27/" + this.workspace + "/artifact/snapshot/query.js?" + Ext.Object.toQueryString(this.query) +
                    "&fields=" + JSON.stringify(this.requestedFields) + "&sort={_ValidFrom:1}",
                method:"GET",
                success:function (response) {
                    this._afterQueryReturned(JSON.parse(response.responseText));
                },
                scope:this
            });
        },

        _afterQueryReturned:function (queryResultsData) {
            if (queryResultsData.TotalResultCount > 0) {
                this._buildChartConfigAndCallback(queryResultsData);
            } else {
                this.buildFinishedCallback(false);
            }
        },

        _buildChartConfigAndCallback: function(queryResultsData) {
            var lumenize = require('./lumenize');
            var results = queryResultsData.Results;
            var cfdConfig = {
                groupByField: 'ScheduleState',
                groupByFieldValues: [41529074, 41529075, 41529076, 41529077, 41529078, 41529079],
                //groupByFieldValues: ['Defined', 'In-Progress', 'Accepted'],
                useAllGroupByFieldValues: false,  // Extras are added to end. Setting to 'false' will just use the ones in groupByFieldValues.
                maxDaysBack: 90,
                startTrackingGroupByFieldValue: results[results.length - 1]['ScheduleState'],
                // aggregationField: "PlanEstimate",
                // aggregationFunction: "$sum",
                // aggregationLabel: 'Sum of Plan Estimate',
                aggregationField: "ObjectID",
                aggregationFunction: "$count",
                aggregationLabel: 'Count of Stories',
                workDays: 'Monday, Tuesday, Wednesday, Thursday, Friday',
                timezone: 'America/Denver',
                holidays: [
                  { month: 12, day: 25 },
                  { year: 2011, month: 11, day: 26 },
                  { year: 2011, month: 1, day: 5}  // Made up holiday to demo holiday knockout
                ]
            };

            lumenize.ChartTime.setTZPath("");
            var tscResults = cfdCalculator(queryResultsData.Results, cfdConfig);

            var categories = tscResults.categories;
            var series = tscResults.series;
            var chartConfiguration = {
                    chart: {
                        renderTo: 'container',
                        defaultSeriesType: 'area',
                        zoomType: 'x'
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: this.chartTitle
                    },
                    subtitle: {
                        text: 'State field: ' + cfdConfig.groupByField
                    },
                    xAxis: {
                        categories: categories,
                        tickmarkPlacement: 'on',
                        tickInterval: Math.floor(categories.length / 8), // set as a function of the length of categories
                        title: {
                            enabled: false
                        }
                        // set dateTimeLabelFormats
                    },
                    yAxis: {
                        title: {
                            text: cfdConfig.aggregationLabel
                        },
                        labels: {
                            formatter: function () {
                                return this.value / 1;
                            }
                        }
                    },
                    tooltip: {
                        formatter: function () {
                            return '' + this.x + '<br />' + this.series.name + ': ' + this.y;
                        }
                    },
                    plotOptions: {
                        area: {
                            stacking: 'normal',
                            lineColor: '#666666',
                            lineWidth: 1,
                            marker: {
                                lineWidth: 1,
                                lineColor: '#666666'
                            }
                        },
                        series: {
                            allowPointSelect: true,
                            point: {
                                events: {
                                    select: function (event) {
                                        // Use this to highlight the rows in a table
                                        alert('ObjectIDs: ' +
                                            JSON.stringify(tscResults.drillDownObjectIDs[this.series.name][this.x]));
                                    },
                                    unselect: function (event) {
                                        alert('Unselect rows')
                                    }
                                }
                            }
                        }
                    },
                    series: series
                };

            this.buildFinishedCallback(true, chartConfiguration);
        }
    });
})();