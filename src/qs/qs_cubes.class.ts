export class cubeConfigs {

    msre: any;
    dims: any;

    constructor() {
        this.msre = {
            qInfo: {
                qType: 'MeasureList'
            },
            qMeasureListDef: {
                qType: 'measure',
                qData: {
                    title: '/title',
                    tags: '/tags'
                }
            }
        };
        this.dims = {
            qInfo: {
                qType: 'DimensionList'
            },
            qDimensionListDef: {
                qType: 'dimension',
                qData: {
                    title: '/title',
                    tags: '/tags',
                    grouping: '/qDim/qGrouping',
                    info: '/qDimInfos'
                }
            }
        };
    };
    
	buildHyperCube (dim, kpi) {
		return {
			qInfo: {
					qType: 'transientHyperCube'
			},
			qHyperCubeDef: {
				qInitialDataFetch: [
					{
						qHeight: 10,
						qWidth: 4
					}
				],
				qDimensions: [
					{
						qLibraryId: dim,
						qNullSuppression: true,
						qOtherTotalSpec: {
							qOtherMode: "OTHER_OFF",
							qSuppressOther: true,
							qOtherSortMode: "OTHER_SORT_ASCENDING",
							qOtherCounted: {
								qv: "5"
							},
							qOtherLimitMode: "OTHER_GE_LIMIT"
						}
					}
				],
				qMeasures: [
					{
						qLibraryId: kpi,
						qSortBy: {
							qSortByState: 0,
							qSortByFrequency: 0,
							qSortByNumeric: -1,
							qSortByAscii: 0,
							qSortByLoadOrder: 0,
							qSortByExpression: 0,
							qExpression: {
								qv: ""
							}
						}
					}
				],
				qSuppressZero: false,
				qSuppressMissing: false,
				qMode: "S",
				qInterColumnSortOrder: [1,0]
			}
		}
	};

	buildHyperCubeAsc (dim, kpi) {
		return {
			qInfo: {
					qType: 'transientHyperCube'
			},
			qHyperCubeDef: {
				qInitialDataFetch: [
					{
						qHeight: 10,
						qWidth: 4
					}
				],
				qDimensions: [
					{
						qLibraryId: dim,
						qNullSuppression: true,
						qOtherTotalSpec: {
							qOtherMode: "OTHER_OFF",
							qSuppressOther: true,
							qOtherSortMode: "OTHER_SORT_ASCENDING",
							qOtherCounted: {
								qv: "5"
							},
							qOtherLimitMode: "OTHER_GE_LIMIT"
						}
					}
				],
				qMeasures: [
					{
						qLibraryId: kpi,
						qSortBy: {
							qSortByState: 0,
							qSortByFrequency: 0,
							qSortByNumeric: 1,
							qSortByAscii: 0,
							qSortByLoadOrder: 0,
							qSortByExpression: 0,
							qExpression: {
								qv: ""
							}
						}
					}
				],
				qSuppressZero: false,
				qSuppressMissing: false,
				qMode: "S",
				qInterColumnSortOrder: [1,0]
			}
		}
	};

	buildHyperCubeKPIonly (kpi) {
		return {
			qInfo: {
					qType: 'transientHyperCube'
			},
			qHyperCubeDef: {
				qInitialDataFetch: [
					{
						qHeight: 1,
						qWidth: 1
					}
				],
				qMeasures: [
					{
						qLibraryId: kpi,
						qSortBy: {
							qSortByState: 0,
							qSortByFrequency: 0,
							qSortByNumeric: -1,
							qSortByAscii: 0,
							qSortByLoadOrder: 0,
							qSortByExpression: 0,
							qExpression: {
								qv: ""
							}
						}
					}
				],
				qSuppressZero: false,
				qSuppressMissing: false,
				qMode: "S",
				qInterColumnSortOrder: [0]
			}
		}
	}
}