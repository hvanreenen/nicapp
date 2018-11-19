function RoomDetailsPage() {
    var page = new Page($("#RoomDetailsPage"), "Meet ruimte");
    var self = $.extend(this, page);

    self.render = function () {
        page.render();
        var auditRoom = nicApp.currentAuditRoom;
        $("#title").text("Meting ruimte: " + auditRoom.toString());
        var nicAuditRoomCategory = findInArray(nicApp.currentAudit.NICAuditRoomCategories, "NICRoomCategoryId", auditRoom.NICRoomCategoryId);
        $("#spanRoomCategory").text(nicAuditRoomCategory.Description + "s: " + nicAuditRoomCategory.TotalM2Finished + "m2 van " + nicAuditRoomCategory.TotalM2InSample + "m2 gemeten");
        //$("#spanRoomNumber").text(auditRoom.RoomNumber);
        $("#spanRoomDescription").text(auditRoom.toString());
        //$("#spanRoomArea").text(auditRoom.Area + "m2");

        $("#CheckboxRoomOccupied").prop("checked", auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied);

        $("#roomDetails input").prop("disabled", auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied);
        $("#roomDetails a").prop("disabled", auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied);
        $("#CheckboxRoomOccupied").prop("disabled", false);
        $("#CheckboxRoomOccupied").checkboxradio('refresh');

        $("#CheckboxRoomOccupied").unbind("click");
        $("#CheckboxRoomOccupied").click(function () {
            self.setRoomOccupied();
        });

        $("#SaveRoomDetails").show();
        $("#SaveRoomDetailsWithRemarks").show();
        $("#tbodyElements button").removeAttr("disabled");
        if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied) {
            $("#SaveRoomDetails").hide();
            $("#SaveRoomDetailsWithRemarks").hide();
            //werkt niet
            $("#tbodyElements button").attr("disabled", "disabled");
            $("#tbodyElements button").button();
            $("#tbodyElements button").button("refresh");
        }

        $("#SaveRoomDetails").unbind("click");
        $("#SaveRoomDetails").click(function () {
            if (self.save()) {
                var cancelSaveAction = true;
                if (nicApp.currentAudit.countUnfinishedRoomsInSample() == 0) {
                    nicApp.showPage("FinalReportPage", cancelSaveAction);

                }
                else {
                    nicApp.showPage("RoomSelectionPage", cancelSaveAction);
                }
            }
        });

        $("#SaveRoomDetailsWithRemarks").unbind("click");
        $("#SaveRoomDetailsWithRemarks").click(function () {
            nicApp.showPage("RoomRemarksPage");
        });

        if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
            $(".nicExtra").show();
            $(".nicPlus").hide();
            self.renderRoomDetails_NicExtra();
        }
        else if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {
            $(".nicExtra").hide();
            $(".nicPlus").show();
            self.renderRoomDetails_NicPlus();
        }

        self.attachOnChangeEvents();
    }

    self.renderRoomDetails_NicPlus = function () {
        var audit = nicApp.currentAudit;
        var auditRoom = nicApp.currentAuditRoom;

        //eerst alle omhoog
        $("span.toggleButtonGroup", self.formElement).find("a").attr("class", "toggleButton");

        for (var i in auditRoom.NICAuditRoomInventories) {
            var roomResult = auditRoom.NICAuditRoomInventories[i];
            var areaOfAttentionName = roomResult.AreaOfAttentionName;
            //1. togglebuttons juiste indrukken
            var spanGroup = $("span.toggleButtonGroup[title=" + areaOfAttentionName + "]");
            var result = roomResult.Result;
            if (result == 'G') {
                spanGroup.children("a[title=G]").toggleClass("toggleButtonDownGreen");
                $("#selectInspectionRemarks_" + areaOfAttentionName).attr('disabled', 'disabled');
                $("#textboxInspectionRemarks_" + areaOfAttentionName).attr('disabled', 'disabled');
            }
            else if (result == 'O') {
                spanGroup.children("a[title=O]").toggleClass("toggleButtonDownOrange");
            }
            else if (result == 'A') {
                spanGroup.children("a[title=A]").toggleClass("toggleButtonDownRed");
            }

            //data aan toggleGroupSpan koppelen
            spanGroup.attr("data-result", result);

            //2. vullen select
            var optHtml = "<option value='0'>*** Opmerkingen ***</option>";
            var areaOfAttentionId = NicModel.DatabaseIDs.AreasOfAttention[auditRoom.RoomIndication][areaOfAttentionName];
            Enumerable.From(NicModel.StaticData.RoomResultDescriptions).Where("$.IndInterieurSoort == " + areaOfAttentionId).OrderBy("$.Description.toLowerCase()").ForEach(function (item, index) {
                optHtml += "<option value='" + item.Id + "'>" + item.Description + "</option>";
            });
            $("#selectInspectionRemarks_" + areaOfAttentionName).html(optHtml);
            $("#selectInspectionRemarks_" + areaOfAttentionName).val(roomResult.RoomResultDescriptionId ? roomResult.RoomResultDescriptionId : 0);
            $("#selectInspectionRemarks_" + areaOfAttentionName).selectmenu("refresh");

            //3. vullen textbox
            $("#textboxInspectionRemarks_" + areaOfAttentionName).val(roomResult.Remark);
        }

        //gedrag togglebutton
        $(".toggleButton").click(function () {
            var span = $(this).parent();
            //eerst alle unselected
            span.find("a").attr("class", "toggleButton");
            //dan huidige selected
            var result = $(this).text();
            if (result == 'G') {
                $(this).toggleClass("toggleButtonDownGreen");
            }
            else if (result == 'O') {
                $(this).toggleClass("toggleButtonDownOrange");
            }
            else if (result == 'A') {
                $(this).toggleClass("toggleButtonDownRed");
            }

            var type = span.attr("title");
            var textBox = $("#textboxInspectionRemarks_" + span.attr("title"));
            var selectBox = $("#selectInspectionRemarks_" + span.attr("title"));
            textBox.prop('disabled', (result == 'G'));
            if (result == 'G') {
                textBox.val('');
                textBox.attr("disabled", "disabled");
                selectBox.attr("disabled", "disabled");
                selectBox.val(0);
                selectBox.selectmenu('refresh');
            }
            else {
                textBox.removeAttr("disabled");
                selectBox.removeAttr("disabled");
            }

            span.attr("data-result", result);
        });
    }

    self.renderRoomDetails_NicExtra = function () {
        var audit = nicApp.currentAudit;
        var auditRoom = nicApp.currentAuditRoom;

        //self.renderPopupFaultTypes_NicExtra();

        //maken tabel met elementen
        $("#tbodyElements").html("");

        //eerst kijken of er al resultaten zijn
        var list = Enumerable.From(auditRoom.AuditElements).OrderBy("$.Name");

        //zo nee, dan kijken naar aantallen uit vorige meting:
        if (list.Count() == 0) {
            list = Enumerable.From(auditRoom.NICRoomInventories)
                .Join(NicModel.StaticData.Elements, "$.ElementId", "$.Id", function (inner, outer) {
                    return {
                        ElementId: outer.Id,
                        Name: outer.Name,
                        Number3: 0,
                        Number6: inner.Number,
                        Number8: 0,
                        NumberTotal: inner.Number,
                        FaultTypes: []
                    }
                }).OrderBy("$.Name");
        }
        //nog geen elementen in lijst, dan elementen ophalen per ruimtecategorie
        if (list.Count() == 0) {
            list = Enumerable.From(NicModel.StaticData.RoomCategoryElements)
                .Join(NicModel.StaticData.Elements, "$.ElementId", "$.Id", function (inner, outer) {
                    return {
                        ElementId: outer.Id,
                        Name: outer.Name,
                        Ind_DefElem: inner.Ind_DefElem, //heb je nodig voor de where
                        RoomCategoryId: inner.RoomCategoryId, //heb je nodig voor de where
                        Number3: 0,
                        Number6: 0,
                        Number8: 0,
                        NumberTotal: 0,
                        FaultTypes: []
                    }
                }).Where("$.RoomCategoryId == " + auditRoom.NICRoomCategoryId + " && $.Ind_DefElem == 1")
                .OrderBy("$.Name");
        }
        

        list.ForEach(function (item, index) {
            var tr = self.appendRoomDetailsElementRow(item);
            $("#tbodyElements").append(tr);
        });
        self.attachEventsRoomDetailsElementsTable();

        var ul = $("#listExtraElements");
        ul.html("");
        Enumerable.From(NicModel.StaticData.Elements).OrderBy("$.Name").ForEach(function (item, index) {
            var li = $(document.createElement("li"));
            li.attr("id", item.Id);
            li.text(item.Name);
            li.click(function () {
                //kijken of die al bestaat
                var exists = $("#tbodyElements").find("tr#" + item.Id).length > 0;
                if (exists) {
                    alert("Element staat al in de lijst");
                    return;
                }
                var newElementResult = {
                    ElementId: $(this).attr("id"),
                    Name: $(this).text(),
                    Number3: 0,
                    Number6: 0,
                    Number8: 0,
                    NumberTotal: 0,
                    FaultTypes: []
                }
                var tr = self.appendRoomDetailsElementRow(newElementResult);
                $("#tbodyElements").append(tr);
                self.attachEventsRoomDetailsElementsTable();

                $('input[data-type="search"]').val("");
                //zoeklijst weer inklappen
                $('input[data-type="search"]').trigger("keyup");
            });

            ul.append(li);
        });
        ul.filterable({ filterReveal: true });

    }

    self.appendRoomDetailsElementRow = function (elementResult) {
        var item = elementResult;
        var tr = $(document.createElement("tr"));
        tr.attr("id", item.ElementId);
        td = $(document.createElement("td"));
        td.text(elementResult.Name);
        tr.append(td);

        td = $(document.createElement("td"));
        td.html('<button class="btn3 ui-btn ui-shadow ui-corner-all">' + elementResult.Number3 + '</button>');
        tr.append(td);

        td = $(document.createElement("td"));
        td.html('<button class="btn6 ui-btn ui-shadow ui-corner-all">' + elementResult.Number6 + '</button>');
        tr.append(td);

        td = $(document.createElement("td"));
        td.html('<button class="btn8 ui-btn ui-shadow ui-corner-all">' + elementResult.Number8 + '</button>');
        tr.append(td);

        td = $(document.createElement("td"));
        td.html('<button class="btnTot ui-btn ui-shadow ui-corner-all">' + elementResult.NumberTotal + '</button>');
        tr.append(td);

        td = $(document.createElement("td"));
        //uitgezet: reset button, aantal aanpassen werkt nu met tabhold
        //td.html('<input type="reset" value="&cularr;" class="btnTot ui-btn ui-shadow ui-corner-all" />');
        tr.append(td);

        td = $(document.createElement("td"));
        tr.append(td);
        $("#tbodyElements").append(tr);

        //extra regel per element voor foutsoort-beschrijvingen. Is standaard verborgen
        tr = $(document.createElement("tr"));
        if (elementResult.FaultTypes.length == 0) {
            tr.css("display", "none");
        }
        td = $(document.createElement("td"));
        tr.append(td);

        td = $(document.createElement("td"));
        td.attr("colspan", "6");
        var span = $(document.createElement("span"));
        span.attr("id", "spanFaultTypes_" + elementResult.ElementId);
        span.attr("class", "faultTypesSpan");
        for (var i in elementResult.FaultTypes) {
            var faultType = elementResult.FaultTypes[i];
            $(span).append('<span class="spanFaultType" onclick="javascript:nicApp.pages.RoomDetailsPage.openPageFaultTypes(' + item.ElementId + ');"><u>' + faultType.Name + '</u>');
            $(span).append(' (' + faultType.Ind_PODO + ')');
            if (faultType.NumberOfFaults > 1) {
                $(span).append(' (' + faultType.NumberOfFaults + ')');
            }
            $(span).append('; <span>');
        }

        td.append(span);

        tr.append(td);


        return tr;
    }

    self.attachEventsRoomDetailsElementsTable = function () {
        //eerste events unbinden
        
        $("#tbodyElements button").unbind("click");
        $("#tbodyElements button").unbind("tabhold");


        $("#tbodyElements button").click(function (event) {
            var num = parseInt($(this).text());
            num++;
            $(this).text(num.toString());

            var thisClass = $(this).attr("class");
            var tr = $(this).closest("tr");
            var elementId = tr.attr("id");
            self.calcElementRow($(this), thisClass);
            //bij click op button3: open Faulttypes
            if (thisClass.indexOf("btn3") >= 0) {
                
                self.openPageFaultTypes(elementId, num);
            }
            self.isChanged = true;
        });

        $("#tbodyElements button").bind("taphold", function () {
            var buttonElementResult = $(this);
            var buttonElementResultClass = buttonElementResult.attr("class");
            var originValue = buttonElementResult.text();
            $("#numberPicker").popup("open", {});
            $("#numberPicker").unbind("popupafterclose");
            $("#numberPicker").on("popupafterclose",
                function (event, ui) {
                    self.calcElementRow(buttonElementResult, buttonElementResultClass);
                    if (buttonElementResultClass.indexOf("btn3") >= 0) {
                        var tr = $(buttonElementResult).closest("tr");
                        var elementId = tr.attr("id");
                        var number3 = parseInt($("#numberPicker .title").text());
                        if (number3 == 0) {
                            //bij wijziging terug naar 0
                            //alles weer leegmaken
                            var auditRoom = nicApp.currentAuditRoom;
                            var auditElement = auditRoom.getElementById(elementId);
                            // alle leegmaken en parent-rij verbergen
                            
                            // array leeg maken
                            auditElement.FaultTypes = [];
                            var spanFaultTypes = $("#spanFaultTypes_" + elementId);
                            //span ook leegmaken
                            spanFaultTypes.html("");
                            spanFaultTypes.parent().parent().hide();
                        }
                        else {
                            self.openPageFaultTypes(elementId, number3);
                        }

                    }
                    self.isChanged = true;
                }
            );

            $("#numberPicker .title").text(originValue);

            $("#numberPicker button").unbind("click");

            $("#numberPicker .numberButton").click(function () {
                if ($("#numberPicker .title").text() == originValue
                    || $("#numberPicker .title").text() == "0") {
                    $("#numberPicker .title").text("");
                }
                $("#numberPicker .title").append($(this).text());
                buttonElementResult.text($("#numberPicker .title").text());
            });

            $("#numberPicker .backspaceButton").click(function () {
                var numberString = $("#numberPicker .title").text();
                var newNumber = numberString.substring(0, numberString.length - 1);
                if (newNumber == "") newNumber = "0";
                $("#numberPicker .title").text(newNumber);
                buttonElementResult.text(newNumber);
            });

            $("#numberPicker .clearButton").click(function () {
                $("#numberPicker .title").text("0");
                buttonElementResult.text("0");
            });

            $("#numberPicker .OKButton").click(function () {
                $("#numberPicker").popup("close");
            });

        });
    }

    self.calcElementRow = function (button, buttonClass) {

        var tr = $(button).closest("tr");

        var btn3 = $(tr).find('td').eq(1).find('button');
        var btn6 = $(tr).find('td').eq(2).find('button');
        var btn8 = $(tr).find('td').eq(3).find('button');
        var btnTot = $(tr).find('td').eq(4).find('button');

        var num3 = parseInt(btn3.text());
        var num6 = parseInt(btn6.text());
        var num8 = parseInt(btn8.text());
        var tot = parseInt(btnTot.text());

        if (buttonClass.indexOf("btn3") >= 0) {
            num6 = tot - num8 - num3;
        }
        else if (buttonClass.indexOf("btn6") >= 0) {
            tot = num3 + num6 + num8;
        }
        else if (buttonClass.indexOf("btn8") >= 0) {
            num6 = tot - num8 - num3;
        }
        else if (buttonClass.indexOf("btnTot") >= 0) {
            num6 = tot - num8 - num3;
        }

        if (num6 < 0) {
            tot -= num6;
            num6 = 0;
        }
        if (tot < 0) {
            num6 -= tot;
            tot = 0;
        }

        btn3.attr("value", num3.toString());
        btn6.attr("value", num6.toString());
        btn8.attr("value", num8.toString());
        btnTot.attr("value", tot.toString());

        btn3.text(num3.toString());
        btn6.text(num6.toString());
        btn8.text(num8.toString());
        btnTot.text(tot.toString());
    }

    self.openPageFaultTypes = function (elementId, number3) {
        var element = findInArray(NicModel.StaticData.Elements, "Id", elementId);

        var auditElement = nicApp.currentAuditRoom.getElementById(elementId);
        auditElement.Name = element.Name;
        if (number3) {
            //bij aanroep vanuit hyperlink is number3 al bepaald
            auditElement.Number3 = number3;
        }
        nicApp.currentAuditElement = auditElement;
        nicApp.showPage("FaultTypesPage", false);
    }

    self.reRenderRoomElements = function () {
        //na sluiten van (modal) page FaultTypes (als popup) is een re-render nodig 
        var auditRoom = nicApp.currentAuditRoom;
        var elementId = nicApp.currentAuditElement.Id;

        //eerste span leegmaken
        var spanFaultTypes = $("#spanFaultTypes_" + elementId);
        spanFaultTypes.html("");
        spanFaultTypes.closest("tr").hide();

        for (var i in nicApp.currentAuditElement.FaultTypes) {
            var faultType = nicApp.currentAuditElement.FaultTypes[i];

            spanFaultTypes.append('<span class="spanFaultType" onclick="javascript:nicApp.pages[\'RoomDetailsPage\'].openPageFaultTypes(' + elementId + ');"><u>' + faultType.Name + '</u>');
            spanFaultTypes.append(' (' + faultType.Ind_PODO + ')');
            if (faultType.NumberOfFaults > 1) {
                spanFaultTypes.append(' (' + faultType.NumberOfFaults + ')');
            }
            spanFaultTypes.append('; <span>');
            spanFaultTypes.closest("tr").show();
            spanFaultTypes.show();
        }

    }

    self.setRoomOccupied = function () {
        var checked = $("#CheckboxRoomOccupied").is(":checked");
        if (checked) {

            if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
                for (var i in nicApp.currentAuditRoom.AuditElements) {
                    var element = nicApp.currentAuditRoom.AuditElements[i];
                    element.Number3 = 0;
                    element.Number6 = element.NumberTotal;
                    element.Number8 = 0;
                    element.FaultTypes = [];
                }
                var query = nicApp.db.saveAudit(toJSON(nicApp.currentAudit));
            }
            else if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {

            }
            nicApp.currentAudit.removeRoomFromSample(nicApp.currentAuditRoom);
            nicApp.showPage("RoomSelectionPage", {});
        }
        else {
            nicApp.currentAudit.appendRoomToSample(nicApp.currentAuditRoom);
            self.render();
        }

        if (!nicApp.currentAudit.sampleIsValid()) {
            nicApp.addMessage("invalidSample" + nicApp.currentAudit.Id, nicApp.currentAudit.toString() + ": Ter info: De steekproef heeft te weinig vierkante meters.")
        }
        else {
            nicApp.removeMessage("invalidSample" + nicApp.currentAudit.Id);
        }
    }

    self.save = function () {
        var isValid = false;
        var auditRoom = nicApp.currentAuditRoom;

        if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
            isValid = self.saveRoomDetails_NicExtra();
        }
        else if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {
            isValid = self.saveRoomDetails_NicPlus();
        }

        if (isValid) {
            self.isChanged = false;
            if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Backup) {
                auditRoom.Ind_Gemeten = NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished;
            }
            else if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.UnFinished) {
                auditRoom.Ind_Gemeten = NicModel.DatabaseIDs.AuditRoomStatus.Finished;
            }

            auditRoom.calcTotalInspectionResult();
            var nicAuditRoomCategory = findInArray(nicApp.currentAudit.NICAuditRoomCategories, "NICRoomCategoryId", auditRoom.NICRoomCategoryId);
            nicAuditRoomCategory.TotalM2Finished += auditRoom.Area;

            if (nicApp.currentAudit.countUnfinishedRoomsInSample() == 0) {
                nicApp.currentAudit.makeFinalCalculations();
                if (nicApp.currentAudit.AuditStateId < NicModel.DatabaseIDs.Status.Calculated) {
                    nicApp.currentAudit.AuditStateId = NicModel.DatabaseIDs.Status.Calculated;
                }
            }

            var query = nicApp.db.saveAudit(toJSON(nicApp.currentAudit));
            nicApp.removeMessage("invalidRoom" + auditRoom.Id);
        }
        else {
            nicApp.addMessage("invalidRoom" + auditRoom.Id, auditRoom.toString() + ": Kan niet opslaan. U moet bij afkeur van een aandachtsgebied tenminste een opmerking kiezen uit de lijst, of een eigen opmerking plaatsen.")
        }

        return isValid;
    }

    self.saveRoomDetails_NicPlus = function () {

        var auditRoom = nicApp.currentAuditRoom;
        var areasOfAttentionNames = { floors: 'floors', interior: 'interior', inventory: 'inventory' };
        //clear array
        auditRoom.NICAuditRoomInventories = [];

        for (var areaOfAttentionName in areasOfAttentionNames) {
            var result = $("span.toggleButtonGroup[title=" + areaOfAttentionName + "]").attr('data-result');
            var faultId = $("#selectInspectionRemarks_" + areaOfAttentionName).val();
            var faultDescription = $("#selectInspectionRemarks_" + areaOfAttentionName + " option:selected").text();

            var auditRoomInventory = new NicModel.AuditRoomInventory();
            auditRoomInventory.Id = generateUUID();
            auditRoomInventory.NICAuditId = nicApp.currentAudit.Id;
            auditRoomInventory.NICAuditRoomId = auditRoom.Id;
            auditRoomInventory.AreaOfAttentionId = NicModel.DatabaseIDs.AreasOfAttention[auditRoom.RoomIndication][areaOfAttentionName];
            auditRoomInventory.RoomResultDescriptionId = parseInt(faultId);

            auditRoomInventory.RoomResultDescription = faultDescription;
            auditRoomInventory.ResultId = NicModel.DatabaseIDs.Results[result];
            auditRoomInventory.Remark = $("#textboxInspectionRemarks_" + areaOfAttentionName).val();;
            if (auditRoomInventory.RoomResultDescriptionId == 0) {
                auditRoomInventory.RoomResultDescriptionId = null;
                auditRoomInventory.RoomResultDescription = '';
            }
            auditRoomInventory.M2 = auditRoom.Area;
            //extra vars voor js
            auditRoomInventory.AreaOfAttentionName = areaOfAttentionName;
            auditRoomInventory.RoomIndication = auditRoom.RoomIndication;
            auditRoomInventory.Result = result;
            auditRoom.NICAuditRoomInventories.push(auditRoomInventory);
        }

        var isValid = auditRoom.isValid();
        //eerst alle verbergen
        $("span.validationMsg").hide();
        for (var i in auditRoom.NICAuditRoomInventories) {
            var roomResult = auditRoom.NICAuditRoomInventories[i];
            if (roomResult.ResultId != NicModel.DatabaseIDs.Results.G &&
                ((!roomResult.RoomResultDescriptionId || roomResult.RoomResultDescriptionId == 0) &&
                roomResult.Remark == "")) {
                $("span.validationMsg[title=" + roomResult.AreaOfAttentionName + "]").show();
                isValid = false;
            }
        }

        return isValid;
    }

    self.saveRoomDetails_NicExtra = function () {
        var isValid = true;
        var auditRoom = nicApp.currentAuditRoom;

        var results = [];

        $("#tbodyElements").find("tr").each(function (i) {
            var tr = $(this);
            var id = tr.attr("id");
            if (id) {
                var elementName = $(tr).find('td').eq(0).text();
                var btn3 = $(tr).find('td').eq(1).find('button');
                var btn6 = $(tr).find('td').eq(2).find('button');
                var btn8 = $(tr).find('td').eq(3).find('button');
                var btnTot = $(tr).find('td').eq(4).find('button');

                var num3 = parseInt(btn3.text());
                var num6 = parseInt(btn6.text());
                var num8 = parseInt(btn8.text());
                var tot = parseInt(btnTot.text());

                //if (tot > 0) {
                    var result = auditRoom.getElementById(id);
                    result.Name = elementName;
                    result.NumberTotal = tot;
                    result.Number3 = num3;
                    result.Number6 = num6;
                    result.Number8 = num8;
                    results.push(result);
                //}
            }
        });

        auditRoom.AuditElements = results;

        return isValid;
    }
    return self;
}