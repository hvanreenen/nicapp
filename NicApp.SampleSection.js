///Maken steekproef
NicApp.prototype.createSampleOfRooms_old = function () {
    var roomsExcluded = [];

    $('#buildingsTree input:checked').each(function () {
        roomsExcluded.push($(this).attr("name"));
    });

    this.currentAudit.createSampleOfRooms(roomsExcluded);
}

NicApp.prototype.renderSampleSection = function (formElement, params) {
    var self = this;
    $("#title").text("Steekproef (alleen lezen)");

    if (nicApp.currentAudit.AuditStateId <= NicModel.DatabaseIDs.Status.NewOpen) {
        this.currentAudit.createSampleOfRooms();
    }
    this.renderTableSampleSize();


    var divRoot = $("#buildingsTree");
    divRoot.empty();

    Enumerable.From(self.currentAudit.Buildings).OrderBy("$.SortOrder").ForEach(function (item, index) {
        var building = item;
        var divBuilding = $(document.createElement("div"));
        divBuilding.attr("data-role", "collapsible");
        divBuilding.attr("data-collapsed", "false");
        divBuilding.html("<h4>" + building.Name + "</h4>");

        Enumerable.From(building.Floors).OrderBy("$.SortOrder").ForEach(function (item, index) {
            var floor = item;
            var divFloor = $(document.createElement("div"));
            divFloor.attr("data-role", "collapsible");
            divFloor.html("<h4>" + floor.Name + "</h4>");

            Enumerable.From(floor.Rooms).OrderBy("$.RoomNumber").ForEach(function (item, index) {
                var room = item;
                var category = NicModel.StaticData.GetById("RoomCategories", room.NICRoomCategoryId);

                //var pRoom = $(document.createElement("p"));

                var html = "<label><input id='checkboxInSample_" + room.Id + "' onclick='javascript:nicApp.changeRoomInSample(" + room.Id + ");' name='" + room.Id + "' type='checkbox' />";
                html += room.RoomDescription;
                if (room.RoomNumber && room.RoomNumber != "") {
                    html += " - " + room.RoomNumber;
                }
                html += " (" + category.Description;
                html += ", " + room.Area + "m2)";
                html += "</label>";

                //ruimtes die in sample zitten, aanvinken
                var auditRoom = self.currentAudit.getAuditRoomById(room.Id);
                if (auditRoom) {
                    html = "<label><input id='checkboxInSample_" + room.Id + "' onclick='javascript:nicApp.changeRoomInSample(" + room.Id + ");' name='" + room.Id + "' type='checkbox' checked='checked'/>";

                    //uitgezet disabled, want mag nu steekproef niet aanpassen
                    //ruimtes die al zijn geweest: disabled
                    //ruimtes die bezet zijn ook 
                    //if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished ||
                    //    auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished) {
                    //    html = "<label><input id='checkboxInSample_" + room.Id + "' onclick='javascript:nicApp.changeRoomInSample(" + room.Id + ");' name='" + room.Id + "' type='checkbox' checked='checked' disabled='disabled'/>";
                    //}
                    //else if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied) {
                    //    html = "<label><input id='checkboxInSample_" + room.Id + "' onclick='javascript:nicApp.changeRoomInSample(" + room.Id + ");' name='" + room.Id + "' type='checkbox' disabled='disabled'/>";
                    //}
                    html += room.RoomDescription;
                    if (room.RoomNumber && room.RoomNumber != "") {
                        html += " - " + room.RoomNumber;
                    }
                    html += " (" + category.Description;
                    html += ", " + room.Area + "m2)";
                    if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied) {
                        html += " BEZET";
                    }

                    if (auditRoom.Ind_Gemeten == 1) {
                        //vinkje plaatsen
                        if (auditRoom.TotalInspectionResult == 'O') {
                            html += " <span style='font-family: Arial Unicode MS, Lucida Grande;color:orange'>&#10004; </span> ";
                        }
                        else if (auditRoom.TotalInspectionResult == 'A') {
                            html += " <span style='font-family: Arial Unicode MS, Lucida Grande;color:red'>&#10004; </span> ";
                        }
                        else {
                            html += " <span style='font-family: Arial Unicode MS, Lucida Grande;color:green'>&#10004; </span> ";
                        }
                    }
                    html += "</label>";
                }


                //pRoom.html(html);
                divFloor.append(html);
            });
            divBuilding.append(divFloor);
        });

        divRoot.append(divBuilding);

    });
    var html = divRoot.html();


    $(divRoot).find("input").checkboxradio({ defaults: true });
    $(divRoot).collapsibleset();
    
}

NicApp.prototype.renderTableSampleSize = function () {
    $("#tableNeededInSample").html("");
    var totalM2NeededInSample = 0, totalM2InBuilding = 0, totalM2InSample = 0, totalM2Finished = 0;
    for (var i in this.currentAudit.NICAuditRoomCategories) {
        var nicAuditRoomCategory = this.currentAudit.NICAuditRoomCategories[i];
        if (!nicAuditRoomCategory) continue;
        if (nicAuditRoomCategory.TotalM2InBuilding == 0) continue;


        var tr = $(document.createElement("tr"));
        tr.attr("id", i);

        var td = $(document.createElement("td"));
        td.text(nicAuditRoomCategory.Description + "s: ");
        tr.append(td);

        var td = $(document.createElement("td"));
        td.text(nicAuditRoomCategory.TotalM2InSample + "m2");
        td.css("color", "#900");
        td.css("font-weight", "bold");
        td.css("text-align", "center");
        if (nicAuditRoomCategory.TotalM2InSample >= nicAuditRoomCategory.TotalM2NeededInSample ||
            nicAuditRoomCategory.TotalM2InSample == nicAuditRoomCategory.TotalM2InBuilding) {
            td.css("color", "#0B0");
        }
        tr.append(td);

        var td = $(document.createElement("td"));
        td.text(nicAuditRoomCategory.TotalM2NeededInSample + "m2");
        td.css("color", "#900");
        td.css("font-weight", "bold");
        td.css("text-align", "center");
        if (nicAuditRoomCategory.TotalM2InSample >= nicAuditRoomCategory.TotalM2NeededInSample ||
           nicAuditRoomCategory.TotalM2InSample == nicAuditRoomCategory.TotalM2InBuilding) {
            td.css("color", "#0B0");
        }
        tr.append(td);

        var td = $(document.createElement("td"));
        td.text(nicAuditRoomCategory.TotalM2InBuilding + "m2");
        td.css("color", "#900");
        td.css("font-weight", "bold");
        td.css("text-align", "center");
        if (nicAuditRoomCategory.TotalM2InSample >= nicAuditRoomCategory.TotalM2NeededInSample ||
           nicAuditRoomCategory.TotalM2InSample == nicAuditRoomCategory.TotalM2InBuilding) {
            td.css("color", "#0B0");
        }
        tr.append(td);

        var td = $(document.createElement("td"));
        td.text(nicAuditRoomCategory.TotalM2Finished + "m2");
        td.css("font-weight", "bold");
        td.css("text-align", "center");
        if (nicAuditRoomCategory.TotalM2Finished == nicAuditRoomCategory.TotalM2InSample) {
            td.css("color", "#0B0");
        }
        tr.append(td);

        $("#tableNeededInSample").append(tr);
        totalM2NeededInSample += nicAuditRoomCategory.TotalM2NeededInSample;
        totalM2InSample += nicAuditRoomCategory.TotalM2InSample;
        totalM2InBuilding += nicAuditRoomCategory.TotalM2InBuilding;
        totalM2Finished += nicAuditRoomCategory.TotalM2Finished;
    }
    //laatste rij = totalen 
    var tr = $(document.createElement("tr"));

    var td = $(document.createElement("td"));
    td.text("Totalen");
    tr.append(td);

    var td = $(document.createElement("td"));
    td.text(totalM2InSample + "m2");

    td.css("font-weight", "bold");
    td.css("text-align", "center");
    tr.append(td);

    var td = $(document.createElement("td"));
    td.text(totalM2NeededInSample + "m2");
    td.css("font-weight", "bold");
    td.css("text-align", "center");
    tr.append(td);

    var td = $(document.createElement("td"));
    td.text(totalM2InBuilding + "m2");
    td.css("font-weight", "bold");
    td.css("text-align", "center");
    tr.append(td);

    var td = $(document.createElement("td"));
    td.text(totalM2Finished + "m2");
    td.css("font-weight", "bold");
    td.css("text-align", "center");
    tr.append(td);
    $("#tableNeededInSample").append(tr);

}

NicApp.prototype.changeRoomInSample = function (id) {
    var checked = $("#checkboxInSample_" + id).is(":checked");
    //alle checkboxes readonly laten lijken, want steekproef blijkt toch niet aangepast te mogen worden
    $("#checkboxInSample_" + id).prop("checked", !checked);
    return;

    //haal bovenstaande 2 regels weg, om steekproef handmatig aanpasbaar te laten zijn
    var room = this.currentAudit.getRoomById(id);
    var nicAuditRoomCategory = findInArray(this.currentAudit.NICAuditRoomCategories, "NICRoomCategoryId", room.NICRoomCategoryId);

    if (checked) {
        //toevoegen aan sample
        this.currentAudit.NICAuditRooms.push(room);
        nicAuditRoomCategory.TotalM2InSample += room.Area;

    }
    else {
        //uit sample halen
        this.currentAudit.removeAuditRoomById(id);
        nicAuditRoomCategory.TotalM2InSample -= room.Area;
        
    }
    this.renderTableSampleSize();
}

NicApp.prototype.saveSample = function () {
    var self = this;
    var roomsInSample = [];

    $('#buildingsTree input:checked').each(function () {
        var id = parseInt($(this).attr("name"));
        var room = self.currentAudit.getRoomById(id);
        roomsInSample.push(room);
    });

    this.currentAudit.saveSampleOfRooms(roomsInSample);

    if (!this.currentAudit.sampleIsValid()) {
        this.addMessage("invalidSample" + this.currentAudit.Id, this.currentAudit.toString() + ": Waarschuwing: De steekproef heeft te weinig vierkante meters.")
    }
    else {
        this.removeMessage("invalidSample" + this.currentAudit.Id);
    }
}