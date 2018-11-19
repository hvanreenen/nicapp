function RoomSelectionPage() {
    var page = new Page($("#RoomSelectionPage"), "Kies ruimte");
    var self = $.extend(this, page);

    //self.setMenuButtons(["SyncButton"]);
    //self.setOKButton(false);
    //self.setBackButton("HomePage");

    self.render = function () {
        page.render();

        var tbody = $("tbody", self.formElement);
        tbody.empty();

        if (nicApp.currentAudit.AuditStateId <= NicModel.DatabaseIDs.Status.NewOpen) {
            nicApp.currentAudit.createSampleOfRooms();
        }
        Enumerable.From(nicApp.currentAudit.NICAuditRooms)
            //uitgezet, want Rob wil graag dat de ruimtes op dezelfde plek blijven staan na meten
            //hier onder staat: ind_gemeten = 4 --> maak hem 0, ind_gemeten = 5 --> maak hem 1
            .OrderBy("($.Ind_Gemeten == 4 || $.Ind_Gemeten == 5)? (($.Ind_Gemeten == 4) ? 0: 1): $.Ind_Gemeten")
            .ThenBy("$.BuildingSortOrder").ThenBy("$.FloorSortOrder").ThenBy("$.RoomNumber").ForEach(function (item, index) {
            //.OrderBy("$.BuildingSortOrder").ThenBy("$.FloorSortOrder").ThenBy("$.RoomNumber").ForEach(function (item, index) {

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
                    self.openRoomDetailsPage(id);


                    //self.showPage("RoomDetailsPage", { id: id, index: index });
                    //self.showPage("RoomDetailsPage", { id: id, index: index }, self.saveRoomDetails);
                });

                tbody.append(tr);
                //}
            });
    }

    self.openRoomDetailsPage = function (id) {
        var query = nicApp.db.getAudit(nicApp.currentAudit.Id);
        query.done(function (audit) {
            nicApp.currentAudit = $.extend(new NicModel.Audit(), audit);
            var auditRoom = nicApp.currentAudit.getAuditRoomById(id);
            nicApp.currentAuditRoom = $.extend(auditRoom, new NicModel.AuditRoom());
            nicApp.showPage("RoomDetailsPage");
        });
    }

    return self;
}