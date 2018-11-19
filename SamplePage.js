SamplePage = function () {
    var page = new Page($("#SamplePage"), "Steekproef (alleen lezen)");
    var self = $.extend(this, page);

    //self.setMenuButtons(["SyncButton"]);
    //self.setOKButton(false);
    //self.setBackButton("HomePage");

    self.render = function () {
        page.render();


        if (nicApp.currentAudit.AuditStateId <= NicModel.DatabaseIDs.Status.NewOpen) {
            nicApp.currentAudit.createSampleOfRooms();
        }
        self.renderTableSampleSize();


        var divRoot = $("#buildingsTree");
        divRoot.empty();

        Enumerable.From(nicApp.currentAudit.Buildings).OrderBy("$.SortOrder").ForEach(function (item, index) {
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

                    var html = "<label><input id='checkboxInSample_" + room.Id + "' onclick='javascript:nicApp.pages[\"SamplePage\"].changeRoomInSample(" + room.Id + ");' name='" + room.Id + "' type='checkbox' />";
                    html += room.RoomDescription;
                    if (room.RoomNumber && room.RoomNumber != "") {
                        html += " - " + room.RoomNumber;
                    }
                    html += " (" + category.Description;
                    html += ", " + room.Area + "m2)";
                    html += "</label>";

                    //ruimtes die in sample zitten, aanvinken
                    var auditRoom = nicApp.currentAudit.getAuditRoomById(room.Id);
                    if (auditRoom) {
                        html = "<label><input id='checkboxInSample_" + room.Id + "' onclick='javascript:nicApp.pages[\"SamplePage\"].changeRoomInSample(" + room.Id + ");' name='" + room.Id + "' type='checkbox' checked='checked'/>";

                        //uitgezet disabled, want mag nu steekproef niet aanpassen
                        //ruimtes die al zijn geweest: disabled
                        //ruimtes die bezet zijn ook 
                        //if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished ||
                        //    auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished) {
                        //    html = "<label><input id='checkboxInSample_" + room.Id + "' onclick='javascript:nicApp.pages[\"SamplePage\"].changeRoomInSample(" + room.Id + ");' name='" + room.Id + "' type='checkbox' checked='checked' disabled='disabled'/>";
                        //}
                        //else if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied) {
                        //    html = "<label><input id='checkboxInSample_" + room.Id + "' onclick='javascript:nicApp.pages[\"SamplePage\"].changeRoomInSample(" + room.Id + ");' name='" + room.Id + "' type='checkbox' disabled='disabled'/>";
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


    self.renderTableSampleSize = function () {
        $("#tableNeededInSample").html("");
        var totalM2NeededInSample = 0, totalM2InBuilding = 0, totalM2InSample = 0, totalM2Finished = 0;
        for (var i in nicApp.currentAudit.NICAuditRoomCategories) {
            var nicAuditRoomCategory = nicApp.currentAudit.NICAuditRoomCategories[i];
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

    self.changeRoomInSample = function (id) {
        var checked = $("#checkboxInSample_" + id).is(":checked");
        //alle checkboxes readonly laten lijken, want steekproef blijkt toch niet aangepast te mogen worden
        $("#checkboxInSample_" + id).prop("checked", !checked);
        return;

        //haal bovenstaande 2 regels weg, om steekproef handmatig aanpasbaar te laten zijn
        var room = nicApp.currentAudit.getRoomById(id);
        var nicAuditRoomCategory = findInArray(nicApp.currentAudit.NICAuditRoomCategories, "NICRoomCategoryId", room.NICRoomCategoryId);

        if (checked) {
            //toevoegen aan sample
            nicApp.currentAudit.NICAuditRooms.push(room);
            nicAuditRoomCategory.TotalM2InSample += room.Area;

        }
        else {
            //uit sample halen
            nicApp.currentAudit.removeAuditRoomById(id);
            nicAuditRoomCategory.TotalM2InSample -= room.Area;

        }
        self.renderTableSampleSize();
    }

    //wordt niet gebruikt
    self.saveSample = function () {
        var self = this;
        var roomsInSample = [];

        $('#buildingsTree input:checked').each(function () {
            var id = parseInt($(this).attr("name"));
            var room = nicApp.currentAudit.getRoomById(id);
            roomsInSample.push(room);
        });

        nicApp.currentAudit.saveSampleOfRooms(roomsInSample);

        if (!nicApp.currentAudit.sampleIsValid()) {
            nicApp.addMessage("invalidSample" + nicApp.currentAudit.Id, nicApp.currentAudit.toString() + ": Waarschuwing: De steekproef heeft te weinig vierkante meters.")
        }
        else {
            nicApp.removeMessage("invalidSample" + nicApp.currentAudit.Id);
        }
    }

    return self;
}