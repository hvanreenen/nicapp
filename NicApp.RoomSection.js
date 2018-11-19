
NicApp.prototype.renderRoomSelectionSection = function (formElement, params) {
    var self = this;
    $("#title").text("Kies ruimte uit steekproef");
    var tbody = $("tbody", formElement);
    tbody.empty();
    if (params._direction == 1) {
        tbody.css("top", "0");
    }
    if (nicApp.currentAudit.AuditStateId <= NicModel.DatabaseIDs.Status.NewOpen) {
        this.currentAudit.createSampleOfRooms();
    }
    Enumerable.From(self.currentAudit.NICAuditRooms)
        //uitgezet, want Rob wil graag dat de ruimtes op dezelfde plek blijven staan na meten
        //hier onder staat: ind_gemeten = 4 --> maak hem 0, ind_gemeten = 5 --> maak hem 1
        //.OrderBy("($.Ind_Gemeten == 4 || $.Ind_Gemeten == 5)? (($.Ind_Gemeten == 4) ? 0: 1): $.Ind_Gemeten")

        .OrderBy("$.BuildingSortOrder").ThenBy("$.FloorSortOrder").ThenBy("$.RoomNumber").ForEach(function (item, index) {

            var auditRoom = item;
            //if (auditRoom.Ind_Steekproef == 1 && auditRoom.Ind_Gemeten == 0) {
            var tr = $(document.createElement("tr"));
            tr.attr("id", auditRoom.RoomId);

            var td = $(document.createElement("td"));
            if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished ||
                auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished) {
                //vinkjes plaatsen
                td.append('<span style="font-family: Arial Unicode MS, Lucida Grande">&#10004; </span>'); //vinkje

                if (auditRoom.TotalInspectionResult == 'O') {
                    td.css("color", "orange");
                }
                else if (auditRoom.TotalInspectionResult == 'A') {
                    td.css("color", "red");
                }
                else {
                    td.css("color", "green");
                }
            }
            else if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied) {
                //kruisje voor bezet
                td.append('<span style="font-family: Arial Unicode MS, Lucida Grande">&#10008; </span>'); //kruis
                td.css("color", "red");
            }
            if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Backup ||
                auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished) {

                td.append('<span>R</span>'); //R voor reserve
            }
            tr.append(td);

            td = $(document.createElement("td"));
            td.text(auditRoom.RoomNumber);
            tr.append(td);

            td = $(document.createElement("td"));
            td.text(auditRoom.Area + "m2");
            tr.append(td);

            td = $(document.createElement("td"));
            var roomcategory = NicModel.StaticData.GetById("RoomCategories", auditRoom.NICRoomCategoryId);
            td.text(roomcategory.Description);
            tr.append(td);

            td = $(document.createElement("td"));
            td.text(auditRoom.RoomDescription);
            tr.append(td);

            td = $(document.createElement("td"));
            td.text(auditRoom.BuildingName);
            tr.append(td);

            td = $(document.createElement("td"));
            td.text(auditRoom.FloorName);
            tr.append(td);

            tr.bind("click", function () {
                var id = $(this).attr("id");
                id = parseInt(id);
                //self.showSection("RoomDetailsSection", { id: id, index: index });
                self.showSection("RoomDetailsSection", { id: id, index: index }, self.saveRoomDetails);
            });

            tbody.append(tr);
            //}
        });
    self.setOKButton(false);
    self.setBackButton("AuditDetailsSection");
}

NicApp.prototype.renderRoomDetailsSection = function (formElement, params) {
    var self = this;
    $("#title").text("Meting ruimte");
    var auditRoom = self.currentAudit.getAuditRoomById([params.id]);
    auditRoom.index = params.index;
    self.currentAuditRoom = $.extend(auditRoom, new NicModel.AuditRoom());

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
    $("#SaveRoomDetails").show();
    $("#SaveRoomDetailsWithRemarks").show();
    if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied) {
        $("#SaveRoomDetails").hide();
        $("#SaveRoomDetailsWithRemarks").hide();
        return;
    }
    if (self.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
        $(".nicExtra").show();
        $(".nicPlus").hide();
        this.renderRoomDetails_NicExtra();
    }
    else if (self.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {
        $(".nicExtra").hide();
        $(".nicPlus").show();
        this.renderRoomDetails_NicPlus();
    }
    //self.setOKButton(self.saveRoomDetails);
    //self.setOKButton(false);
    //self.setBackButton("RoomSelectionSection");
}

NicApp.prototype.renderRoomDetails_NicPlus = function (formElement, params) {
    var audit = this.currentAudit;
    var auditRoom = this.currentAuditRoom;

    //eerst alle omhoog
    $("span.toggleButtonGroup", formElement).find("a").attr("class", "toggleButton");

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

NicApp.prototype.renderRoomDetails_NicExtra = function (formElement, params) {
    var audit = this.currentAudit;
    var auditRoom = this.currentAuditRoom;

    this.renderPopupFaultTypes_NicExtra(formElement);

    //maken tabel met elementen
    $("#tbodyElements").html("");

    //eerst kijken of er al resultaten zijn
    var list = Enumerable.From(auditRoom.AuditElements).OrderBy("$.Name");

    //dan kijken naar aantallen uit vorige meting:
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
        var tr = nicApp.appendRoomDetailsElementRow(item);
        $("#tbodyElements").append(tr);
    });
    nicApp.attachEventsRoomDetailsElementsTable();

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
            var tr = nicApp.appendRoomDetailsElementRow(newElementResult);
            $("#tbodyElements").append(tr);
            nicApp.attachEventsRoomDetailsElementsTable();
            //$("#listExtraElements").filterable("refresh");
            $('input[data-type="search"]').val("");
            //zoeklijst weer inklappen
            $('input[data-type="search"]').trigger("keyup");
        });

        ul.append(li);
    });
    ul.filterable({ filterReveal: true });

}

NicApp.prototype.appendRoomDetailsElementRow = function (elementResult) {
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
        $(span).append('<span class="spanFaultType" onclick="javascript:nicApp.openPopupFaultTypes(' + item.ElementId + ');"><u>' + faultType.Name + '</u>');
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

NicApp.prototype.attachEventsRoomDetailsElementsTable = function () {
    //eerste events unbinden
    //uitgezet: reset button, aantal aanpassen werkt nu met tabhold
    //$("#tbodyElements input[type=reset]").unbind("click");
    $("#tbodyElements button").unbind("click");
    $("#tbodyElements button").unbind("tabhold");

    //uitgezet: reset button, aantal aanpassen werkt nu met tabhold
    //$("#tbodyElements input[type=reset]").click(function (event) {
    //    //reset rij: alles op 0
    //    var tr = $(this).closest("tr");
    //    var id = tr.attr("id");
    //    tr.find("button").text("0");
    //    $("#spanFaultType_PO_" + id).html("PO: ");
    //    $("#spanFaultType_DO_" + id).html("DO: ");
    //    $("#spanFaultType_PO_" + id).attr("data-faultIds", "");
    //    $("#spanFaultType_DO_" + id).attr("data-faultIds", "");

    //    $("#spanFaultType_PO_" + id).hide();
    //    $("#spanFaultType_DO_" + id).hide();
    //    //$("#hiddenFaultType_" + id).val("");
    //    $("#spanFaultType_DO_" + id).closest("tr").hide();
    //});

    //$("#tbodyElements input[type=reset]").button({ inline: true });

    $("#tbodyElements button").click(function (event) {
        var num = parseInt($(this).text());
        num++;
        $(this).text(num.toString());

        var thisClass = $(this).attr("class");
        var tr = $(this).closest("tr");
        var id = tr.attr("id");
        nicApp.calcElementRow($(this), thisClass);
        //bij click op button3: open multi-select
        if (thisClass.indexOf("btn3") >= 0) {
            var title = tr.find('td').eq(0).text();
            nicApp.openPopupFaultTypes(id);
        }
    });

    $("#tbodyElements button").bind("taphold", function () {
        var buttonElementResult = $(this);
        var buttonElementResultClass = buttonElementResult.attr("class");
        $("#numberPicker").popup("open", {});
        $("#numberPicker").unbind("popupafterclose");
        $("#numberPicker").on("popupafterclose",
            function (event, ui) {
                nicApp.calcElementRow(buttonElementResult, buttonElementResultClass);
                if (buttonElementResultClass.indexOf("btn3") >= 0) {
                    var tr = $(buttonElementResult).closest("tr");
                    var elementId = tr.attr("id");

                    nicApp.openPopupFaultTypes(elementId);

                }
            }
        );

        $("#numberPicker .title").text("0");
        $("#numberPicker button").unbind("click");

        $("#numberPicker .numberButton").click(function () {
            if ($("#numberPicker .title").text() == "0") {
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

NicApp.prototype.calcElementRow = function (button, buttonClass) {

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

NicApp.prototype.renderPopupFaultTypes_NicExtra = function (formElement) {
    var audit = this.currentAudit;
    var auditRoom = this.currentAuditRoom;

    $("#tbodyFaultTypesPO").html("");
    $("#tbodyFaultTypesDO").html("");

    Enumerable.From(NicModel.StaticData.FaultTypes).Where("$.Kind == 1").OrderBy("$.Description").ForEach(function (item, index) {
        var tr = $(document.createElement("tr"));
        nicApp.renderPopupFaultTypesRow(item, tr, "PO");
        $("#tbodyFaultTypesPO").append(tr);
    });
    Enumerable.From(NicModel.StaticData.FaultTypes).Where("$.Kind == 0").OrderBy("$.Description").ForEach(function (item, index) {
        var tr = $(document.createElement("tr"));
        nicApp.renderPopupFaultTypesRow(item, tr, "DO");
        $("#tbodyFaultTypesDO").append(tr);
    });

}

NicApp.prototype.renderPopupFaultTypesRow = function (item, tr, ind_PODO) {

    tr.attr("id", item.Id);
    tr.attr("data-PODO", ind_PODO);
    var td = $(document.createElement("td"));
    td.text(item.Description);
    tr.append(td);
    td.bind("click", function () {
        nicApp.selectFaultTypeFromPopup(this);
    });

    td = $(document.createElement("td"));
    td.html('<button id="' + item.Id + '" class="btnFaults ui-btn ui-shadow ui-corner-all">0</button>');

    td.find('.btnFaults').click(function () {
        nicApp.appendNumberOfFaultTypes(this);
        //var num = parseInt($(this).text());
        //num++;
        //$(this).text(num.toString());
    });

    //uitgezet, want kan geen twee popups tegelijk openen in jq mobile
    //hierom reset button erbij
    //td.find('button').bind("taphold", function () {
    //    var button = $(this);
    //    $("#popupFaultTypes").popup("close");
    //    var thisClass = $(this).attr("class");
    //    $("#numberPicker").popup("open", {});
    //    $("#numberPicker").popup({
    //        afterclose: function () {
    //            $("#popupFaultTypes").popup("open");
    //        }
    //    });
    //});
    tr.append(td);

    //reset button
    td = $(document.createElement("td"));
    td.html('<input type="reset" value="&cularr;" class="btnReset ui-btn ui-shadow ui-corner-all" />');
    td.find('.btnReset').click(function () {
        var tr = $(this).closest("tr");
        tr.find(".btnFaults").text("0");
    });

    tr.append(td);
}

NicApp.prototype.openPopupFaultTypes = function (elementId) {

    var element = findInArray(NicModel.StaticData.Elements, "Id", elementId);
    var auditElement = this.currentAuditRoom.getElementById(elementId);

    $("#popupFaultTypesTitle").text(element.Name);
    $("#popupFaultTypes").attr("data-id", elementId);
    $("#tbodyFaultTypesDO tr, #tbodyFaultTypesPO tr").each(function () {
        var tr = $(this);
        var faultTypeId = tr.attr("id")
        var button = tr.find(".btnFaults");
        var faultType = findInArray(auditElement.FaultTypes, "FaultTypeId", faultTypeId);
        if (faultType) {
            button.text(faultType.NumberOfFaults.toString());
        }
        else {
            button.text("0");
        }
    });

    nicApp.currentScroll = $("body").scrollTop();
    $("#popupFaultTypes").popup("open", {});

    $("#popupFaultTypes").unbind("popupbeforeposition");
    $("#popupFaultTypes").unbind("popupafterclose");
    $("#popupFaultTypes").on("popupbeforeposition", function (event, ui) {
        $('body').on('touchmove', false);
        $('body').css({
            overflow: 'hidden'
        });

    });
    $("#popupFaultTypes").on("popupafterclose", function (event, ui) {
        nicApp.closePopupFaultTypes();
        $('body').on('touchmove');
        $('body').css({
            overflow: 'auto'
        });
        //terug scrollen naar positie
        $("body").scrollTop(nicApp.currentScroll);
    });

    $("#collapsiblePO").collapsible({ collapsed: true });
    $("#collapsibleDO").collapsible({ collapsed: false });

}

NicApp.prototype.selectFaultTypeFromPopup = function (td) {
    var tr = $(td).closest("tr");
    var buttonFaultType = $(tr).find(".btnFaults");
    //var num = parseInt($(buttonFaultType).text());
    //num++;
    //$(buttonFaultType).text(num.toString());
    this.appendNumberOfFaultTypes(buttonFaultType);
    this.closePopupFaultTypes();
}

NicApp.prototype.appendNumberOfFaultTypes = function (button) {
    var elementId = $("#popupFaultTypes").attr("data-id");
    var num = parseInt($(button).text());
    num++;
    $(button).text(num.toString());

    var total = 0;
    $("#popupFaultTypes .btnFaults").each(function () {
        total += parseInt($(this).text());
    });

    $("#tbodyElements")

    var buttonElementNum3 = $("#" + elementId).find(".btn3");
    var num3 = parseInt(buttonElementNum3.text());
    //if (total > num3) buttonElementNum3.text(total.toString());
    //this.calcElementRow(buttonElementNum3, "btn3");
    if (total == num3) {
        nicApp.closePopupFaultTypes();
    }
}

NicApp.prototype.closePopupFaultTypes = function () {
    var elementId = $("#popupFaultTypes").attr("data-id");
    var isValid = true;
    //validate
    var total = 0;
    $("#popupFaultTypes .btnFaults").each(function () {
        total += parseInt($(this).text());
    });
    var buttonElementNum3 = $("#" + elementId).find(".btn3");
    var num3 = parseInt(buttonElementNum3.text());
    if (total != num3) {
        alert("U moet evenveel fouten definiëren als bij elementen is aangegeven.");
        $("#popupFaultTypes").popup("open", {});
        return;
    }

    var auditRoom = nicApp.currentAuditRoom;
    var auditElement = auditRoom.getElementById(elementId);
    //eerst alle leegmaken en parent-rij verbergen
    $("#spanFaultType_DO_" + elementId).html("");
    $("#spanFaultType_PO_" + elementId).html("");
    $("#spanFaultType_DO_" + elementId).closest("tr").hide();
    //eerst array leeg maken
    auditElement.FaultTypes = [];
    var spanFaultTypes = $("#spanFaultTypes_" + elementId);
    //span ook leegmaken
    spanFaultTypes.html("");

    $("#tbodyFaultTypesDO tr, #tbodyFaultTypesPO tr").each(function () {
        var tr = $(this);
        var button = tr.find(".btnFaults");
        var numberOfFaults = parseInt(button.text());
        if (numberOfFaults > 0) {
            var faultTypeId = $(tr).attr("id");
            var ind_PODO = $(tr).attr("data-PODO");
            var faultTypeName = $(tr).find('td').eq(0).text();
            var faultType = { FaultTypeId: faultTypeId, ElementId: elementId, Ind_PODO: ind_PODO, Name: faultTypeName, NumberOfFaults: numberOfFaults }
            auditElement.FaultTypes.push(faultType);

            spanFaultTypes.append('<span class="spanFaultType" onclick="javascript:nicApp.openPopupFaultTypes(' + elementId + ');"><u>' + faultTypeName + '</u>');
            spanFaultTypes.append(' (' + ind_PODO + ')');
            if (numberOfFaults > 1) {
                spanFaultTypes.append(' (' + numberOfFaults + ')');
            }
            spanFaultTypes.append('; <span>');
            spanFaultTypes.closest("tr").show();
            spanFaultTypes.show();
        }
    });

    $("#popupFaultTypes").popup("close");
}

NicApp.prototype.saveRoomDetails = function () {
    var isValid = false;
    var auditRoom = nicApp.currentAuditRoom;

    if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
        isValid = nicApp.saveRoomDetails_NicExtra();
    }
    else if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {
        isValid = nicApp.saveRoomDetails_NicPlus();
    }

    if (isValid) {

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
            nicApp.currentAudit.AuditStateId = NicModel.DatabaseIDs.Status.AllRoomsFinished;
            nicApp.currentAudit.makeFinalCalculations();
            nicApp.currentAudit.AuditStateId = NicModel.DatabaseIDs.Status.Calculated;
        }

        var query = nicApp.db.saveAudit(toJSON(nicApp.currentAudit));
        nicApp.removeMessage("invalidRoom" + auditRoom.Id);
    }
    else {
        nicApp.addMessage("invalidRoom" + auditRoom.Id, auditRoom.toString() + ": Kan niet opslaan. U moet bij afkeur van een aandachtsgebied tenminste een opmerking kiezen uit de lijst, of een eigen opmerking plaatsen.")
    }
    //if (isValid) {
    //    if (nicApp.currentAudit.countUnfinishedRoomsInSample() == 0) {
    //        nicApp.showSection("AuditReportSection");
    //    }
    //    else {
    //        nicApp.showSection("RoomSelectionSection");
    //    }
    //}
    return isValid;
}

NicApp.prototype.saveRoomDetails_NicPlus = function () {

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

NicApp.prototype.saveRoomDetails_NicExtra = function () {
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

            if (tot > 0) {
                var result = auditRoom.getElementById(id);
                result.Name = elementName;
                result.NumberTotal = tot;
                result.Number3 = num3;
                result.Number6 = num6;
                result.Number8 = num8;
                results.push(result);
            }
        }
    });

    auditRoom.AuditElements = results;

    return isValid;
}

NicApp.prototype.renderRoomRemarksSection = function (formElement, params) {
    var self = this;
    var auditRoom = self.currentAuditRoom;
    $("#title").text("Opmerkingen bij ruimte: " + auditRoom.toString());
    $("#spanRoomName").text(auditRoom.RoomNumber + " " + auditRoom.RoomDescription + " (" + auditRoom.Area + "m2)");

    //vullen checklist
    //eerst leegmaken
    $("#checkBoxListRoomRemarks").html("");
    //to do : uitzoeken wat Kind is
    Enumerable.From(NicModel.StaticData.FaultTypes).Where("$.Kind == 2").OrderBy("$.Description").ForEach(function (item, index) {
        //var div = $(document.createElement("div"));
        var html = "<label><input id='checkbox_" + item.Id + "' name='" + item.Id + "' type='checkbox' />" + item.Description + "</label>";

        //voor de tweede keer getoond: bind aan data
        var itemFoundInArray = findInArray(auditRoom.NICAuditRoomFaults, "NICFaultTypeId", item.Id);
        if (itemFoundInArray) {
            html = "<label><input id='checkboxRoomRemarks_" + item.Id + "' name='" + item.Id + "' type='checkbox' checked='checked'/>" + item.Description + "</label>";
        }
        //div.html(html);
        $("#checkBoxListRoomRemarks").append(html);
    });

    $("#checkBoxListRoomRemarks").find("input[type=checkbox]").checkboxradio({ defaults: true });

    //eerst leegmaken
    $("#checkBoxListOwnRoomRemarks").html("");
    $('#textareaOwnRemarks').val("");

    Enumerable.From(nicApp.currentAudit.NICInspectorRemarks).Where("$.Ind_Soort == 2").OrderBy("$.Remark").ForEach(function (item, index) {
        //var div = $(document.createElement("div"));
        var html = "<label><input id='checkbox_" + item.Id + "' name='" + item.Id + "' type='checkbox' />" + item.Remark + "</label>";

        //voor de tweede keer getoond: bind aan data
        var itemFoundInArray = findInArray(auditRoom.NICAuditRoomRemarkInspectors, "NICInspectorRemarkId", item.Id);
        if (itemFoundInArray) {
            html = "<label><input id='checkboxRoomRemarks_" + item.Id + "' name='" + item.Id + "' type='checkbox' checked='checked'/>" + item.Remark + "</label>";
        }
        //div.html(html);
        $("#checkBoxListOwnRoomRemarks").append(html);
    });

    $("#checkBoxListOwnRoomRemarks").find("input[type=checkbox]").checkboxradio({ defaults: true });

    $(formElement).find("div[data-role=collapsible-set]").collapsibleset();
    $("#remarksSet").collapsibleset();
}

NicApp.prototype.saveRoomRemarks = function () {

    var auditRoom = nicApp.currentAuditRoom;
    var isValid = true;
    auditRoom.NICAuditRoomFaults = [];
    //var remarkIds = [];
    $('#checkBoxListRoomRemarks input:checked').each(function () {
        //remarkIds.push($(this).attr("name"));
        var remarkId = $(this).attr("name");
        var fault = new NicModel.AuditRoomFault();
        fault.NICAuditRoomId = auditRoom.Id;
        fault.NICFaultTypeId = parseInt(remarkId);
        auditRoom.NICAuditRoomFaults.push(fault);

    });

    auditRoom.NICAuditRoomRemarkInspectors = [];
    $('#checkBoxListOwnRoomRemarks input:checked').each(function () {
        //remarkIds.push($(this).attr("name"));
        var remarkId = $(this).attr("name");
        var newRoomInspectorRemark = {
            Id: generateUUID(),
            NICInspectorRemarkId: remarkId,
            NICAuditRoomId: auditRoom.Id
        }
        auditRoom.NICAuditRoomRemarkInspectors.push(newRoomInspectorRemark);

    });

    var ownRemark = $('#textareaOwnRemarks').val();

    if (ownRemark) {
        var newInspectorRemark = {
            Id: generateUUID(),
            NICAuditId: nicApp.currentAudit.Id,
            InspectorId: nicApp.loginId,
            Remark: ownRemark,
            Ind_Soort: 2, //todo: wat is Ind_soort = 2? 
            Ind_Checked: null //todo: wat is Ind_Checked = 2? 
        }
        nicApp.currentAudit.NICInspectorRemarks.push(newInspectorRemark);
        //voor in koppeltabel tussen room en inspecteur opmerking
        var newRoomInspectorRemark = {
            Id: generateUUID(),
            NICInspectorRemarkId: newInspectorRemark.Id,
            NICAuditRoomId: auditRoom.Id
        }
        auditRoom.NICAuditRoomRemarkInspectors.push(newRoomInspectorRemark);

    }

    if (isValid) {
        var query = nicApp.db.saveAudit(toJSON(nicApp.currentAudit));
    }
    else {
        alert('Kan niet opslaan, corrigeer svp de fouten')
    }
    return isValid;
}

