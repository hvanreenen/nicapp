AuditRemarksPage = function () {
    var page = new Page($("#AuditRemarksPage"), "Opmerkingen bij meting");
    var self = $.extend(this, page);

    //self.setMenuButtons(["SyncButton"]);
    //self.setOKButton(false);
    //self.setBackButton("HomePage");

    self.render = function () {
        page.render();
        $("#spanAuditName").text(nicApp.currentAudit.toString());

        if (nicApp.currentAudit.AuditStateId < NicModel.DatabaseIDs.Status.AllRoomsFinished) {
            $("#SaveAuditRemarksButton").show();
            $("#OpenSignPageButton").hide(); //knop met tekst 'door naar ondertekenen'
        }
        else {
            $("#SaveAuditRemarksButton").hide();
            $("#OpenSignPageButton").show();
        }

        $("#checkBoxListAuditRemarks").html("");
        var where = "$.Kind == 3"
        Enumerable.From(NicModel.StaticData.FaultTypes).Where(where).OrderBy("$.Description").ForEach(function (item, index) {
            var html = "<label><input id='checkboxAuditRemark_" + item.Id + "' name='" + item.Id + "' type='checkbox' onclick='javascript:nicApp.pages[\"AuditRemarksPage\"].showTextBoxAuditRemark(" + item.Id + ");' style='float:left; display:inline-block'/>" + item.Description;
            html += "</label>";
            html += "<input type='text' style='display:none' id='textAuditRemark_" + item.Id + "' placeholder= 'eventuele extra opmerkingen...'/>";
            var itemFoundInArray = findInArray(nicApp.currentAudit.NICAuditFaults, "NICFaultTypeId", item.Id);
            if (itemFoundInArray) {
                html = "<label><input id='checkboxAuditRemark_" + item.Id + "' name='" + item.Id + "' type='checkbox' checked='checked' onclick='javascript:nicApp.pages[\"AuditRemarksPage\"].showTextBoxAuditRemark(" + item.Id + ");' style='float:left; display:inline-block'/>" + item.Description;
                html += "</label>";
                html += "<input type='text' id='textAuditRemark_" + item.Id + "' value='" + itemFoundInArray.Remark + "' placeholder= 'eventuele extra opmerkingen...'/>";

            }
            $("#checkBoxListAuditRemarks").append(html);
            if (itemFoundInArray) {
                $("#textAuditRemark_" + item.Id).textinput();
            }
        });
        $("#checkBoxListAuditRemarks").find("input[type=checkbox]").checkboxradio({ defaults: true });
        $("#checkBoxListAuditRemarks").find("input[type=submit]").button({ inline: true });
        //regels code om te zorgen dat op mobiele devices keyboard verwijnt na klik op 'ga'
        $("#checkBoxListAuditRemarks").find("input[type=text]").keypress(function (ev) {
            if (event.which == 13) {
                $(this).blur();
            }
        });



        $("#SaveAuditRemarksButton").unbind("click");
        $("#SaveAuditRemarksButton").click(function () {
            self.save();
            nicApp.navigateBack();
        });

        self.attachOnChangeEvents();
    }

    self.save = function () {
        var audit = nicApp.currentAudit;
        var isValid = true;
        if (!audit.NICAuditFaults) auditRoom.NICAuditFaults = [];
        //tabel NICAuditFault wordt denk ik gebruikt voor zowel adviezen als voor algemene opmerkingen 
        //eerst copieren we alle adviezen in een tijdelijke list, 
        //De opmerkingen laten we ongemoeid, zodat we deze hieronder opnieuw vers kunnen toevoegen aan deze lijst
        var tempArray = [];
        for (var i in audit.NICAuditFaults) {
            var fault = audit.NICAuditFaults[i];

            if (fault.Type == "Advice")
                tempArray.push(fault);
        }
        //deze tijdelijke list zetten we nu in audit
        audit.NICAuditFaults = tempArray;
        //hierna halen we de opmerkingen uit de checkbox list en voegen die toe
        $('#checkBoxListAuditRemarks input:checked').each(function () {
            var remarkId = $(this).attr("name");
            var nicAuditFault = new Object();
            nicAuditFault.Id = generateUUID();
            nicAuditFault.NICAuditId = audit.Id;
            nicAuditFault.Type = "Remark";
            nicAuditFault.NICFaultTypeId = parseInt(remarkId);
            nicAuditFault.Remark = $("#textAuditRemark_" + remarkId).val();
            audit.NICAuditFaults.push(nicAuditFault);
        });

        if (isValid) {
            var query = nicApp.db.saveAudit(toJSON(nicApp.currentAudit));
            self.isChanged = false;
        }
        else {
            alert('Kan niet opslaan, corrigeer svp de fouten')
        }
        return isValid;
    }

    self.showTextBoxAuditRemark = function (id) {
        var isVisible = $("#checkboxAuditRemark_" + id).is(":checked");
        if (isVisible) {
            $("#textAuditRemark_" + id).show();
            $("#textAuditRemark_" + id).textinput();

        }
        else {
            $("#textAuditRemark_" + id).val("");
            $("#textAuditRemark_" + id).hide();
            //om te voorkomen dat textbox als horizontale lijn wordt weergegeven: destroy
            $("#textAuditRemark_" + id).textinput("destroy");
        }
    }

    return self;
}