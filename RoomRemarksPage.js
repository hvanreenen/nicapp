function RoomRemarksPage() {
    var page = new Page($("#RoomRemarksPage"), "Opmerkingen bij ruimte");
    var self = $.extend(this, page);

    self.render = function () {
        page.render();
        var auditRoom = nicApp.currentAuditRoom;
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
        $('#textboxOwnRemarks').val("");

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

        $(self.formElement).find("div[data-role=collapsible-set]").collapsibleset();
        $("#remarksSet").collapsibleset();

        $("#SaveRoomRemarks").unbind("click");
        $("#SaveRoomRemarks").click(function () {
            if (nicApp.currentAudit.countUnfinishedRoomsInSample() == 0) {
                nicApp.showPage("FinalReportPage");
            }
            else {
                nicApp.showPage("RoomSelectionPage");
            }
        });

        self.attachOnChangeEvents();
    }

    self.save = function () {
        var auditRoom = nicApp.currentAuditRoom;
        var isValid = true;
        auditRoom.NICAuditRoomFaults = [];
        //var remarkIds = [];
        $('#checkBoxListRoomRemarks input:checked').each(function () {
            //remarkIds.push($(this).attr("name"));
            var remarkId = $(this).attr("name");
            var fault = new NicModel.AuditRoomFault();
            fault.Id = generateUUID();
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

        var ownRemark = $('#textboxOwnRemarks').val();

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
            self.isChanged = false;
        }
        else {
            alert('Kan niet opslaan, corrigeer svp de fouten')
        }
        return isValid;
    }
    return self;
}
