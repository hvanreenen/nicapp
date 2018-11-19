
NicApp.prototype.renderAuditReportSection = function (formElement, params) {
    var self = this;
    $("#title").text("Totaal overzicht");
    if (self.currentAudit.countUnfinishedRoomsInSample() > 0) {
        this.addMessage("unfinishedRooms" + self.currentAudit.Id, self.currentAudit.toString() + ": Nog niet alle ruimtes zijn gecontroleerd!");
    }
    else {
        this.removeMessage("unfinishedRooms" + self.currentAudit.Id);
    }
   
    if (self.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
        $(".nicExtra").show();
        $(".nicPlus").hide();
        this.renderAuditReportSection_NicExtra();
    }
    else if (self.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {
        $(".nicExtra").hide();
        $(".nicPlus").show();
        this.renderAuditReportSection_NicPlus();
    }

    //self.setOKButton(nicApp.saveAuditDetails);
    self.setBackButton("AuditDetailsSection", nicApp.saveAuditDetails);
    self.setOKButton(false);
}

NicApp.prototype.renderAuditReportSection_NicPlus = function (formElement, params) {
    var self = this;
    var results = self.currentAudit.finalResults;

    var totalBEInBuilding = this.currentAudit.getTotalBEInBuilding();
    var totalBEInAudit = results.totalBE;

    $("#trTotalBEsInBuilding", formElement).find('td').eq(1).text(this.currentAudit.getTotalBEInBuilding("wvv"));
    $("#trTotalBEsInBuilding", formElement).find('td').eq(2).text("-");
    $("#trTotalBEsInBuilding", formElement).find('td').eq(3).text("-");
    $("#trTotalBEsInBuilding", formElement).find('td').eq(4).text(this.currentAudit.getTotalBEInBuilding("sanitair"));

    $("#trTotalBEsInAudit", formElement).find('td').eq(1).text(results.wvv.floors.totalBE);
    $("#trTotalBEsInAudit", formElement).find('td').eq(2).text(results.wvv.floors.totalBE);
    $("#trTotalBEsInAudit", formElement).find('td').eq(3).text(results.wvv.floors.totalBE);
    $("#trTotalBEsInAudit", formElement).find('td').eq(4).text(results.sanitair.floors.totalBE);

    $("#trTotalOs", formElement).find('td').eq(1).text(results.wvv.floors.O);
    $("#trTotalOs", formElement).find('td').eq(2).text(results.wvv.interior.O);
    $("#trTotalOs", formElement).find('td').eq(3).text(results.wvv.inventory.O);
    $("#trTotalOs", formElement).find('td').eq(4).text(results.sanitair.floors.O + results.sanitair.interior.O + results.sanitair.inventory.O);


    $("#trTotalAs", formElement).find('td').eq(1).text(results.wvv.floors.A);
    $("#trTotalAs", formElement).find('td').eq(2).text(results.wvv.interior.A);
    $("#trTotalAs", formElement).find('td').eq(3).text(results.wvv.inventory.A);
    $("#trTotalAs", formElement).find('td').eq(4).text(results.sanitair.floors.A + results.sanitair.interior.A + results.sanitair.inventory.A);

    $("#trMinusPointsO", formElement).find('td').eq(1).text(results.wvv.floors.minusO);
    $("#trMinusPointsO", formElement).find('td').eq(2).text(results.wvv.interior.minusO);
    $("#trMinusPointsO", formElement).find('td').eq(3).text(results.wvv.inventory.minusO);
    $("#trMinusPointsO", formElement).find('td').eq(4).text(results.sanitair.minusO);

    $("#trMinusPointsA", formElement).find('td').eq(1).text(results.wvv.floors.minusA);
    $("#trMinusPointsA", formElement).find('td').eq(2).text(results.wvv.interior.minusA);
    $("#trMinusPointsA", formElement).find('td').eq(3).text(results.wvv.inventory.minusA);
    $("#trMinusPointsA", formElement).find('td').eq(4).text(results.sanitair.minusA);

    $("#trMinusPoints", formElement).find('td').eq(1).text(results.wvv.floors.minusO + results.wvv.floors.minusA);
    $("#trMinusPoints", formElement).find('td').eq(2).text(results.wvv.interior.minusO + results.wvv.interior.minusA);
    $("#trMinusPoints", formElement).find('td').eq(3).text(results.wvv.inventory.minusO + results.wvv.inventory.minusA);
    $("#trMinusPoints", formElement).find('td').eq(4).text(results.sanitair.minusO + results.sanitair.minusA);

    $("#trGrades", formElement).find('td').eq(1).text(results.wvv.floors.grade);
    $("#trGrades", formElement).find('td').eq(2).text(results.wvv.interior.grade);
    $("#trGrades", formElement).find('td').eq(3).text(results.wvv.inventory.grade);
    $("#trGrades", formElement).find('td').eq(4).text(results.sanitair.grade);

    $("#trFactors", formElement).find('td').eq(1).text(results.wvv.floors.factor);
    $("#trFactors", formElement).find('td').eq(2).text(results.wvv.interior.factor);
    $("#trFactors", formElement).find('td').eq(3).text(results.wvv.inventory.factor);
    $("#trFactors", formElement).find('td').eq(4).text(results.sanitair.factor);

    $("#trScores", formElement).find('td').eq(1).text(results.wvv.floors.score);
    $("#trScores", formElement).find('td').eq(2).text(results.wvv.interior.score);
    $("#trScores", formElement).find('td').eq(3).text(results.wvv.inventory.score);
    $("#trScores", formElement).find('td').eq(4).text(results.sanitair.score);

    $("#tdContractPoints", formElement).text(self.currentAudit.ContractPoints);
    $("#tdFinalScore", formElement).text(results.finalScore);
    $("#tdFinalScore", formElement).css("font-weight", "bold");
    if (results.finalScore < self.currentAudit.ContractPoints) {
        $("#tdFinalScore", formElement).css("color", "#900");
    }
    else {
        $("#tdFinalScore", formElement).css("color", "#090");
    }

    this.renderChartScorePerRoomCategoryIndication_NicPlus(results);

    this.renderChart5MostFailures_NicPlus();
}

NicApp.prototype.renderChartScorePerRoomCategoryIndication_NicPlus = function (results) {

    //grafiek
    var data = {
        labels: ["Vloeren", "Interieur", "Inventaris", "Sanitair"],
        datasets: [
            {
                label: "Eindcijfers",
                fillColor: "rgba(0,220,220,0.7)",
                strokeColor: "rgba(0,220,220,1)",
                pointColor: "rgba(0,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: [results.wvv.floors.grade, results.wvv.interior.grade, results.wvv.inventory.grade, results.sanitair.grade]
            }
        ]
    };
    var ctx = document.getElementById("chartNicPlus1").getContext("2d");
    var myNewChart = new Chart(ctx).Bar(data);
    myNewChart.update();

}

NicApp.prototype.renderChart5MostFailures_NicPlus = function () {
    var audit = this.currentAudit;
    var allFailures = audit.getAllFailures_NicPlus();
    var chartData = [];
    var rest = 0;
    //sorteren
    //
    Enumerable.From(allFailures).OrderByDescending("$.total").ForEach(function (item, index) {

        if (index < 5) {
            //alleen bovenste 5 in chart, de rest komt bij rest
            chartData.push(
                {
                    value: item.Total,
                    color: getColorByIndex(index).color,
                    highlight: getColorByIndex(index).highlight,
                    label: item.Name
                }
        );
        }
        else {
            rest += item.total;
        }

    });
    if (rest > 0) {
        chartData.push(
                {
                    value: rest,
                    color: getColorByIndex(5).color,
                    highlight: getColorByIndex(5).highlight,
                    label: "Rest"
                }
        );
    }

    var ctx = document.getElementById("chartNicPlus2").getContext("2d");
    var chart = new Chart(ctx).Pie(chartData);
    chart.update();

    //legenda maken, legenda template krijg ik niet aan de praat
    $("#legendChartNicPlus2").html("");
    for (var i in chartData) {
        var dataItem = chartData[i];
        var html = '<li><span style="color:' + dataItem.color + '">&#9724;</span> ' + dataItem.label + ' (' + dataItem.value + ')</li>';
        $("#legendChartNicPlus2").append(html);
    }
    
}

NicApp.prototype.renderAuditReportSection_NicExtra = function (formElement, params) {
    var self = this;

    $("#CheckboxReAudit").prop("checked", self.currentAudit.ReAuditDate != null);
    $("#textReasonReAudit").val(nicApp.currentAudit.ReasonReAudit);
    $("#validationMsg_ReasonReAudit").hide();
    if (nicApp.currentAudit.ReAuditDate) {
        $("#divReasonReAudit").show();
    }
    else {
        $("#divReasonReAudit").hide();
    }
    

    var chartDataLabels = [], chartDataScores = [], chartDataPercFailures = [], chartDataGKPs = [];
    $("#tbodyReportNicExtra").html("");
    //per ruimte categorie
    for (var i in self.currentAudit.NICAuditRoomCategories) {
        var category = self.currentAudit.NICAuditRoomCategories[i];
        var tr = $(document.createElement("tr"));

        td = $(document.createElement("td"));
        td.text(category.Description + "s");
        tr.append(td);

        td = $(document.createElement("td"));
        td.text(category.TotalM2InSample + "m2");
        tr.append(td);

        td = $(document.createElement("td"));
        td.text(category.TotalM2Finished + "m2");
        tr.append(td);

        td = $(document.createElement("td"));
        td.text(category.NumberOfFaultsDO);
        tr.append(td);

        td = $(document.createElement("td"));
        td.text(category.NumberOfFaultsPO);
        tr.append(td);

        td = $(document.createElement("td"));
        td.text(category.GKG);
        tr.append(td);

        td = $(document.createElement("td"));
        td.text(category.Score.toFixed(1));
        tr.append(td);

        $("#tbodyReportNicExtra").append(tr);

        chartDataLabels.push(category.Description + "s");
        chartDataScores.push(category.Score.toFixed(1));
        chartDataGKPs.push(category.GKP);
        chartDataPercFailures.push(category.Perc3.toFixed(0));
    }

    this.renderChartScorePerRoomCategory_NicExtra(chartDataLabels, chartDataScores);

    this.renderChartFaultPercPerRoomCategory_NicExtra(chartDataLabels, chartDataGKPs, chartDataPercFailures);

    this.renderChart5MostFailures_NicExtra();

    this.renderChart5MostElementsWithFailures_NicExtra();

}

NicApp.prototype.renderChartScorePerRoomCategory_NicExtra = function (chartDataLabels, chartDataScores) {
    //grafiek
    var data = {
        labels: chartDataLabels,
        datasets: [
            {
                label: "Eindcijfers",
                fillColor: "rgba(0,220,220,0.7)",
                strokeColor: "rgba(0,220,220,1)",
                pointColor: "rgba(0,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: chartDataScores
            }
        ]
    };
    var ctx = document.getElementById("chartNicExtra1").getContext("2d");
    var chart = new Chart(ctx).Bar(data);
    chart.update();
}

NicApp.prototype.renderChartFaultPercPerRoomCategory_NicExtra = function (chartDataLabels, chartDataGKPs, chartDataPercFailures) {
    //grafiek 2
    var data = {
        labels: chartDataLabels,
        datasets: [
            {
                label: "Foutpercentages",
                fillColor: "rgba(0,220,220,0.7)",
                strokeColor: "rgba(0,220,220,1)",
                pointColor: "rgba(0,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: chartDataPercFailures
            },
            {
                label: "Goedkeurpercentages",
                fillColor: "rgba(220,220,220,0.7)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: chartDataGKPs
            }

        ]
    };
    var ctx = document.getElementById("chartNicExtra2").getContext("2d");
    var chart = new Chart(ctx).Bar(data);
    chart.update();
}

NicApp.prototype.renderChart5MostFailures_NicExtra = function () {
    var audit = this.currentAudit;
    var allFailures = audit.getAllFailures_NicExtra();
    var chartData = [];
    var rest = 0;
    //sorteren
    //
    Enumerable.From(allFailures).OrderByDescending("$.Total").ForEach(function (item, index) {

        if (index < 5) {
            //alleen bovenste 5 in chart, de rest komt bij rest
            chartData.push(
                {
                    value: item.Total,
                    color: getColorByIndex(index).color,
                    highlight: getColorByIndex(index).highlight,
                    label: item.Name
                }
        );
        }
        else {
            rest += item.Total;
        }

    });

    chartData.push(
            {
                value: rest,
                color: getColorByIndex(5).color,
                highlight: getColorByIndex(5).highlight,
                label: "Rest"
            }
    );
    var ctx = document.getElementById("chartNicExtra3").getContext("2d");
    var chart = new Chart(ctx).Pie(chartData);
    chart.update();

    //legenda maken, legenda template krijg ik niet aan de praat
    $("#legendChartNicExtra3").html("");
    for (var i in chartData) {
        var dataItem = chartData[i];
        var html = '<li><span style="color:' + dataItem.color + '">&#9724;</span> ' + dataItem.label + ' (' + dataItem.value + ')</li>';
        $("#legendChartNicExtra3").append(html);
    }
}

NicApp.prototype.renderChart5MostElementsWithFailures_NicExtra = function () {
    var audit = this.currentAudit;
    var elementsWithFailures = audit.getAllElementsWithFailures();
    var chartData = [];
    var rest = 0;
    //sorteren
    //
    Enumerable.From(elementsWithFailures).OrderByDescending("$.Total").ForEach(function (item, index) {

        if (index < 5) {
            //alleen bovenste 5 in chart, de rest komt bij rest
            chartData.push(
                {
                    value: item.Total,
                    color: getColorByIndex(index).color,
                    highlight: getColorByIndex(index).highlight,
                    label: item.ElementName
                }
        );
        }
        else {
            rest += item.total;
        }

    });
    if (rest > 0) {
        chartData.push(
                {
                    value: rest,
                    color: getColorByIndex(5).color,
                    highlight: getColorByIndex(5).highlight,
                    label: "Rest"
                }
        );
    }

    var ctx = document.getElementById("chartNicExtra4").getContext("2d");
    var chart = new Chart(ctx).Pie(chartData);
    chart.update();

    //legenda maken, legenda template krijg ik niet aan de praat
    $("#legendChartNicExtra4").html("");
    for (var i in chartData) {
        var dataItem = chartData[i];
        var html = '<li><span style="color:' + dataItem.color + '">&#9724;</span> ' + dataItem.label + ' (' + dataItem.value + ')</li>';
        $("#legendChartNicExtra4").append(html);
    }
}

NicApp.prototype.saveAuditReportSection = function () {
    var checked = $("#CheckboxReAudit").is(":checked");
    var isValid = true;
    if (checked) {
        nicApp.currentAudit.ReAuditDate = new Date(Date.now());
        nicApp.currentAudit.ReasonReAudit = $("#textReasonReAudit").val();
        if ($("#textReasonReAudit").val() == "") {
            isValid = false;
            $("#validationMsg_ReasonReAudit").show();
            nicApp.addMessage("noReasonReAudit", "U moet bij een aanvraag voor herinspectie een reden opgeven.");
        }
        if (isValid) {
            nicApp.removeMessage("noReasonReAudit");
            nicApp.db.saveAudit(toJSON(nicApp.currentAudit))
        }
    }
    return isValid;
   
}

function getColorByIndex(index) {
    if (index == 0) {
        return { color: "#F7464A", highlight: "#FF5A5E" }; //red
    }
    else if (index == 1) {
        return { color: "#46BFBD", highlight: "#5AD3D1" }; //green
    }
    else if (index == 2) {
        return { color: "#FDB45C", highlight: "#FFC870" }; //yellow
    }
    else if (index == 3) {
        return { color: "#46BF46", highlight: "#5AD350" };
    }
    else if (index == 4) {
        return { color: "#F7F64A", highlight: "#FFFF5E" };
    }
    else if (index == 5) {
        return { color: "#949FB1", highlight: "#A8B3C5" };
    }
}
