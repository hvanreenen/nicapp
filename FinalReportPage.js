FinalReportPage = function () {
    var page = new Page($("#FinalReportPage"), "Totaal overzicht");
    var self = $.extend(this, page);

    self.render = function () {
        if (nicApp.currentAudit.AuditStateId < NicModel.DatabaseIDs.Status.AllRoomsFinished) {
            page.menuButtons = ["AuditDetailsButton", "AuditRoomsButton", "AuditSampleButton", "AuditRemarksButton", "AuditNotesButton"];
        }
        else if (nicApp.currentAudit.AuditStateId < NicModel.DatabaseIDs.Status.Signed) {
            page.menuButtons = ["AuditDetailsButton", "AuditRoomsButton", "AuditSampleButton", "AuditRemarksButton2", "AuditNotesButton", "AuditReportButton", "AuditSignButton", "AuditAdviceButton"];
        }
        else {
            page.menuButtons = ["AuditDetailsButton", "AuditRoomsButton", "AuditSampleButton", "AuditRemarksButton2", "AuditNotesButton", "AuditReportButton", "AuditSignButton", "AuditAdviceButton", "AuditCloseButton"];
        }
        page.render();

        if (nicApp.currentAudit.countUnfinishedRoomsInSample() > 0) {
            nicApp.addMessage("unfinishedRooms" + nicApp.currentAudit.Id, nicApp.currentAudit.toString() + ": Nog niet alle ruimtes zijn gecontroleerd!");
        }
        else {
            nicApp.removeMessage("unfinishedRooms" + nicApp.currentAudit.Id);
        }

        if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
            $(".nicExtra", self.formElement).show();
            $(".nicPlus", self.formElement).hide();
            self.renderAuditReportPage_NicExtra();
        }
        else if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {
            $(".nicExtra", self.formElement).hide();
            $(".nicPlus", self.formElement).show();
            self.renderAuditReportPage_NicPlus();
        }
        $("#OpenSignPage").unbind("click");
        $("#OpenSignPage").click(function () {
            nicApp.showPage("SignAuditPage");
        });

        self.attachOnChangeEvents();
    }

    self.save = function () {
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
        }
        else {
            nicApp.currentAudit.ReAuditDate = null;
        }
        if (isValid) {
            self.isChanged = false;
            nicApp.removeMessage("noReasonReAudit");
            nicApp.db.saveAudit(toJSON(nicApp.currentAudit))
        }
        return isValid;
    }

    self.renderAuditReportPage_NicPlus = function () {
        var self = this;
        var results = nicApp.currentAudit.finalResults;
        if (!results) {
            nicApp.currentAudit.makeFinalCalculations();
            results = nicApp.currentAudit.finalResults;
        }
        var totalBEInBuilding = nicApp.currentAudit.getTotalBEInBuilding();
        var totalBEInAudit = results.totalBE;

        $("#trTotalBEsInBuilding", self.formElement).find('td').eq(1).text(nicApp.currentAudit.getTotalBEInBuilding("wvv"));
        $("#trTotalBEsInBuilding", self.formElement).find('td').eq(2).text(nicApp.currentAudit.getTotalBEInBuilding("wvv"));
        $("#trTotalBEsInBuilding", self.formElement).find('td').eq(3).text(nicApp.currentAudit.getTotalBEInBuilding("wvv"));
        $("#trTotalBEsInBuilding", self.formElement).find('td').eq(4).text(nicApp.currentAudit.getTotalBEInBuilding("sanitair"));

        $("#trTotalBEsInAudit", self.formElement).find('td').eq(1).text(results.wvv.floors.totalBE);
        $("#trTotalBEsInAudit", self.formElement).find('td').eq(2).text(results.wvv.floors.totalBE);
        $("#trTotalBEsInAudit", self.formElement).find('td').eq(3).text(results.wvv.floors.totalBE);
        $("#trTotalBEsInAudit", self.formElement).find('td').eq(4).text(results.sanitair.floors.totalBE);

        $("#trTotalOs", self.formElement).find('td').eq(1).text(results.wvv.floors.O);
        $("#trTotalOs", self.formElement).find('td').eq(2).text(results.wvv.interior.O);
        $("#trTotalOs", self.formElement).find('td').eq(3).text(results.wvv.inventory.O);
        $("#trTotalOs", self.formElement).find('td').eq(4).text(results.sanitair.floors.O + results.sanitair.interior.O + results.sanitair.inventory.O);


        $("#trTotalAs", self.formElement).find('td').eq(1).text(results.wvv.floors.A);
        $("#trTotalAs", self.formElement).find('td').eq(2).text(results.wvv.interior.A);
        $("#trTotalAs", self.formElement).find('td').eq(3).text(results.wvv.inventory.A);
        $("#trTotalAs", self.formElement).find('td').eq(4).text(results.sanitair.floors.A + results.sanitair.interior.A + results.sanitair.inventory.A);

        $("#trMinusPointsO", self.formElement).find('td').eq(1).text(results.wvv.floors.minusO.toFixed(2));
        $("#trMinusPointsO", self.formElement).find('td').eq(2).text(results.wvv.interior.minusO.toFixed(2));
        $("#trMinusPointsO", self.formElement).find('td').eq(3).text(results.wvv.inventory.minusO.toFixed(2));
        $("#trMinusPointsO", self.formElement).find('td').eq(4).text(results.sanitair.minusO.toFixed(2));

        $("#trMinusPointsA", self.formElement).find('td').eq(1).text(results.wvv.floors.minusA.toFixed(2));
        $("#trMinusPointsA", self.formElement).find('td').eq(2).text(results.wvv.interior.minusA.toFixed(2));
        $("#trMinusPointsA", self.formElement).find('td').eq(3).text(results.wvv.inventory.minusA.toFixed(2));
        $("#trMinusPointsA", self.formElement).find('td').eq(4).text(results.sanitair.minusA.toFixed(2));

        $("#trMinusPoints", self.formElement).find('td').eq(1).text((results.wvv.floors.minusO + results.wvv.floors.minusA).toFixed(2));
        $("#trMinusPoints", self.formElement).find('td').eq(2).text((results.wvv.interior.minusO + results.wvv.interior.minusA).toFixed(2));
        $("#trMinusPoints", self.formElement).find('td').eq(3).text((results.wvv.inventory.minusO + results.wvv.inventory.minusA).toFixed(2));
        $("#trMinusPoints", self.formElement).find('td').eq(4).text((results.sanitair.minusO + results.sanitair.minusA).toFixed(2));

        $("#trGrades", self.formElement).find('td').eq(1).text(results.wvv.floors.grade.toFixed(2));
        $("#trGrades", self.formElement).find('td').eq(2).text(results.wvv.interior.grade.toFixed(2));
        $("#trGrades", self.formElement).find('td').eq(3).text(results.wvv.inventory.grade.toFixed(2));
        $("#trGrades", self.formElement).find('td').eq(4).text(results.sanitair.grade.toFixed(2));

        $("#trFactors", self.formElement).find('td').eq(1).text(results.wvv.floors.factor);
        $("#trFactors", self.formElement).find('td').eq(2).text(results.wvv.interior.factor);
        $("#trFactors", self.formElement).find('td').eq(3).text(results.wvv.inventory.factor);
        $("#trFactors", self.formElement).find('td').eq(4).text(results.sanitair.factor);

        $("#trScores", self.formElement).find('td').eq(1).text(results.wvv.floors.score.toFixed(2));
        $("#trScores", self.formElement).find('td').eq(2).text(results.wvv.interior.score.toFixed(2));
        $("#trScores", self.formElement).find('td').eq(3).text(results.wvv.inventory.score.toFixed(2));
        $("#trScores", self.formElement).find('td').eq(4).text(results.sanitair.score.toFixed(2));

        $("#tdContractPoints", self.formElement).text(nicApp.currentAudit.ContractPoints);
        $("#tdFinalScore", self.formElement).text(results.finalScore.toFixed(0));
        $("#tdFinalScore", self.formElement).css("font-weight", "bold");
        if (results.finalScore < nicApp.currentAudit.ContractPoints) {
            $("#tdFinalScore", self.formElement).css("color", "#900");
        }
        else {
            $("#tdFinalScore", self.formElement).css("color", "#090");
        }
        if (results.sanitair.score == 0) {
            $("#tdFinalScoreRemarks", self.formElement).text("(Omdat er geen sanitaire ruimten zijn is som van totalen vermenigvuldig met factor 1,67)");
            

        }
        else {
            $("#tdFinalScoreRemarks", self.formElement).text("");
        }

        self.renderChartScorePerRoomCategoryIndication_NicPlus(results);

        self.renderChart5MostFailures_NicPlus();
    }

    self.renderChartScorePerRoomCategoryIndication_NicPlus = function (results) {

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

    self.renderChart5MostFailures_NicPlus = function () {
        var audit = nicApp.currentAudit;
        var allFailures = audit.getAllFailures_NicPlus();
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
                        color: self.getColorByIndex(index).color,
                        highlight: self.getColorByIndex(index).highlight,
                        label: item.Name
                    }
            );
            }
            else {
                rest += item.Total;
            }

        });
        if (rest > 0) {
            chartData.push(
                    {
                        value: rest,
                        color: self.getColorByIndex(5).color,
                        highlight: self.getColorByIndex(5).highlight,
                        label: "Rest"
                    }
            );
        }
        //header zetten
        if (chartData.length == 0) {
            $("#headerChartNicPlus2").text("Er zijn geen fouten in deze meting");
            $("#chartNicPlus2").hide();
        }
        else if (chartData.length == 1) {
            $("#headerChartNicPlus2").text("Er komt 1 foutsoort voor in deze meting");
        }
        else if (chartData.length > 1 && allFailures.length <= 5) {
            $("#headerChartNicPlus2").text("De " + chartData.length + " voorkomende foutsoorten in deze meting.");
        }
        else {
            $("#headerChartNicPlus2").text("De 5 meest voorkomende foutsoorten in deze meting.");
        }

        //grafiek zetten
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

    self.renderAuditReportPage_NicExtra = function () {
        $("#CheckboxReAudit").unbind("click");
        $("#CheckboxReAudit").click(function () {
            var checked = $("#CheckboxReAudit").is(":checked");
            if (checked) {
                $("#divReasonReAudit").show();
            }
            else {
                $("#divReasonReAudit").hide();
                $("#textReasonReAudit").val('');
            }
        });
        $("#CheckboxReAudit").prop("checked", nicApp.currentAudit.ReAuditDate != null);
        $("#CheckboxReAudit").checkboxradio("refresh");
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
        for (var i in nicApp.currentAudit.NICAuditRoomCategories) {
            var category = nicApp.currentAudit.NICAuditRoomCategories[i];
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
            chartDataPercFailures.push((category.Perc3 / 2).toFixed(1));
        }

        self.renderChartScorePerRoomCategory_NicExtra(chartDataLabels, chartDataScores);

        self.renderChartFaultPercPerRoomCategory_NicExtra(chartDataLabels, chartDataGKPs, chartDataPercFailures);

        self.renderChart5MostFailures_NicExtra();

        self.renderChart5MostElementsWithFailures_NicExtra();

    }

    self.renderChartScorePerRoomCategory_NicExtra = function (chartDataLabels, chartDataScores) {
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

    self.renderChartFaultPercPerRoomCategory_NicExtra = function (chartDataLabels, chartDataGKPs, chartDataPercFailures) {
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

        //legenda maken, legenda template krijg ik niet aan de praat
        $("#legendChartNicExtra2").html("");

        var html = '<li><span style="color:rgba(0,220,220,0.7)">&#9724;</span>Percentage fouten</li>';
        html += '<li><span style="color:rgba(220,220,220,0.7)">&#9724;</span>Goedkeurpercentage</li>';

        $("#legendChartNicExtra2").append(html);

    }

    self.renderChart5MostFailures_NicExtra = function () {
        var audit = nicApp.currentAudit;
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
                        color: self.getColorByIndex(index).color,
                        highlight: self.getColorByIndex(index).highlight,
                        label: item.Name
                    }
            );
            }
            else {
                rest += item.Total;
            }

        });

        //header zetten
        if (chartData.length == 0) {
            $("#headerChartNicExtra3").text("Er zijn geen fouten in deze meting");
            $("#chartNicExtra3").hide();
        }
        else if (chartData.length == 1) {
            $("#headerChartNicExtra3").text("Er komt 1 foutsoort voor in deze meting");
        }
        else if (chartData.length > 1 && allFailures.length <= 6) {
            $("#headerChartNicExtra3").text("De " + chartData.length + " voorkomende foutsoorten in deze meting.");
        }
        else {
            $("#headerChartNicExtra3").text("De 5 meest voorkomende foutsoorten in deze meting.");
        }

        //chardata
        chartData.push(
                {
                    value: rest,
                    color: self.getColorByIndex(5).color,
                    highlight: self.getColorByIndex(5).highlight,
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

    self.renderChart5MostElementsWithFailures_NicExtra = function () {
        var audit = nicApp.currentAudit;
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
                        color: self.getColorByIndex(index).color,
                        highlight: self.getColorByIndex(index).highlight,
                        label: item.ElementName
                    }
            );
            }
            else {
                rest += item.Total;
            }

        });
        if (rest > 0) {
            chartData.push(
                    {
                        value: rest,
                        color: self.getColorByIndex(5).color,
                        highlight: self.getColorByIndex(5).highlight,
                        label: "Rest"
                    }
            );
        }
        //header zetten
        if (chartData.length == 0) {
            $("#legendChartNicExtra4").text("Er zijn geen afgekeurd elementen in deze meting");
            $("#chartNicExtra4").hide();
        }
        else if (chartData.length == 1) {
            $("#legendChartNicExtra4").text("Er komt 1 afgekeurd element voor in deze meting");
        }
        else if (chartData.length > 1 && elementsWithFailures.length <= 6) {
            $("#legendChartNicExtra4").text("De " + chartData.length + " voorkomende afgekeurd elementen");
        }
        else {
            $("#legendChartNicExtra4").text("De 5 meest voorkomende afgekeurd elementen");
        }

        //chardata
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

    self.saveAuditReportPage = function () {
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
        }
        if (isValid) {
            nicApp.removeMessage("noReasonReAudit");
            nicApp.db.saveAudit(toJSON(nicApp.currentAudit))
        }
        return isValid;

    }

    self.getColorByIndex = function (index) {
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

    return self;
}