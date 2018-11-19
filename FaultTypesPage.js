FaultTypesPage = function () {
    var page = new Page($("#FaultTypesPage"), "Foutsoorten bij element");
    var self = $.extend(this, page);

    self.render = function () {
        self.isModal = true;
        page.render();
        var audit = nicApp.currentAudit;
        var auditRoom = nicApp.currentAuditRoom;
        var auditElement = nicApp.currentAuditElement;
        self.auditElement = auditElement;
        self.totalFaults = 0;
        $("#title").text("Foutsoorten bij element: " + auditElement.Name);

        $("#tbodyFaultTypesPO").html("");
        $("#tbodyFaultTypesDO").html("");

        Enumerable.From(NicModel.StaticData.FaultTypes).Where("$.Kind == 1").OrderBy("$.Description").ForEach(function (item, index) {
            var tr = $(document.createElement("tr"));
            self.renderFaultTypesRow(item, tr, "PO");
            $("#tbodyFaultTypesPO").append(tr);
        });
        Enumerable.From(NicModel.StaticData.FaultTypes).Where("$.Kind == 0").OrderBy("$.Description").ForEach(function (item, index) {
            var tr = $(document.createElement("tr"));
            self.renderFaultTypesRow(item, tr, "DO");
            $("#tbodyFaultTypesDO").append(tr);
        });
        $("#CloseFaultTypes").unbind("click");
        $("#CloseFaultTypes").click(function () {
            self.tryClosePage();
        });

    }

    self.renderFaultTypesRow = function (item, tr, ind_PODO) {

        tr.attr("id", item.Id);
        tr.attr("data-PODO", ind_PODO);
        var td = $(document.createElement("td"));
        td.text(item.Description);
        tr.append(td);
        td.bind("click", function () {
            self.selectFaultTypeFrom(this);
        });

        td = $(document.createElement("td"));
        var faultType = findInArray(self.auditElement.FaultTypes, "FaultTypeId", item.Id);
        if (faultType) {
            td.html('<button id="' + item.Id + '" class="btnFaults ui-btn ui-shadow ui-corner-all">' + faultType.NumberOfFaults.toString() + '</button>');
            self.totalFaults += faultType.NumberOfFaults;
        }
        else {
            td.html('<button id="' + item.Id + '" class="btnFaults ui-btn ui-shadow ui-corner-all">0</button>');
        }

        td.find('.btnFaults').click(function () {
            self.appendNumberOfFaultTypes(this);
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
            //reset actie
            var tr = $(this).closest("tr");
            var faultTypeId = tr.attr("id");
            var faultType = findInArray(self.auditElement.FaultTypes, "FaultTypeId", faultTypeId);
            if (faultType) {
                self.totalFaults -= faultType.NumberOfFaults;
                removeFromArray(self.auditElement.FaultTypes, "FaultTypeId", faultTypeId);
            }
            
            tr.find(".btnFaults").text("0");
        });

        tr.append(td);
    }

    
    self.selectFaultTypeFrom = function (td) {
        //na klik op een rij
        var buttonFaultType = $(tr).find(".btnFaults");
        self.appendNumberOfFaultTypes(buttonFaultType);
    }

    self.appendNumberOfFaultTypes = function (buttonFaultType) {
        //ophogen nummer
        var numberOfFaults = parseInt($(buttonFaultType).text());
        numberOfFaults++;
        self.totalFaults++;
        $(buttonFaultType).text(numberOfFaults.toString());

        var tr = $(buttonFaultType).closest("tr");
        var faultTypeId = $(tr).attr("id");
        var faultType = findInArray(self.auditElement.FaultTypes, "FaultTypeId", faultTypeId);
        if (faultType) {
            faultType.NumberOfFaults = numberOfFaults;
        }
        else {
            //nieuwe aanmaken
            var elementId = self.auditElement.Id;
            var ind_PODO = $(tr).attr("data-PODO");
            var faultTypeName = $(tr).find('td').eq(0).text();
            faultType = { FaultTypeId: faultTypeId, ElementId: elementId, Ind_PODO: ind_PODO, Name: faultTypeName, NumberOfFaults: numberOfFaults }
            self.auditElement.FaultTypes.push(faultType);
        }
        if (self.totalFaults == self.auditElement.Number3) {
            self.tryClosePage();
        }
    }

    self.tryClosePage = function () {
        //in navigateBack() wordt save() aangeroepen
        nicApp.navigateBack();
    }

    self.save = function () {
        
        var auditElement = nicApp.currentAuditElement;

        var isValid = (self.totalFaults == self.auditElement.Number3)
        if (!isValid) {
            alert("U moet evenveel fouten definiëren als bij het element is aangegeven, namelijk " + auditElement.Number3);

        }
        else {
            nicApp.pages.RoomDetailsPage.reRenderRoomElements();

            nicApp.db.saveAudit(toJSON(nicApp.currentAudit));

            self.isChanged = false;
        }
        return isValid;
    }

    return self;
}