function AuditDetailsPage() {
    var page = new Page($("#AuditDetailsPage"), "Meting details");
    var self = $.extend(this, page);


    self.render = function () {
        var audit = nicApp.currentAudit;
        if (audit.AuditStateId < NicModel.DatabaseIDs.Status.AllRoomsFinished) {
            page.menuButtons = ["AuditDetailsButton", "AuditRoomsButton", "AuditSampleButton", "AuditRemarksButton", "AuditNotesButton"];
        }
        else if (audit.AuditStateId < NicModel.DatabaseIDs.Status.Signed) {
            page.menuButtons =["AuditDetailsButton", "AuditRoomsButton", "AuditSampleButton", "AuditRemarksButton2", "AuditNotesButton", "AuditReportButton", "AuditSignButton", "AuditAdviceButton"];
        }
        else {
            page.menuButtons = ["AuditDetailsButton", "AuditRoomsButton", "AuditSampleButton", "AuditRemarksButton2", "AuditNotesButton", "AuditReportButton", "AuditSignButton", "AuditAdviceButton", "AuditCloseButton"];
        }
        page.render();

        

        $("#OpenFinalReportPage").hide();
        if (audit.AuditStateId == NicModel.DatabaseIDs.Status.NewOpen) {
            $("#StartAuditButton").text("Start meting");
        }
        else if (audit.AuditStateId < NicModel.DatabaseIDs.Status.Calculated) {
            $("#StartAuditButton").text("Doorgaan met meting");
        }
        else {
            $("#StartAuditButton").text("Meting heropenen");
            $("#OpenFinalReportPage").show();
        }


        if (audit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
            $(".nicExtra").show();
            $(".nicPlus").hide();
            //vullen select
            //var optHtml = "";
            //Enumerable.From(NicModel.StaticData.Cat_Audits).Where("$.NICAuditSystemId==" + audit.NICAuditSystemId).OrderBy("$.Description").ForEach(function (item, index) {
            //    if (audit.IdCat_Meting == item.Id) {
            //        optHtml += "<option value='" + item.Id + "' selected>" + item.Name + "</option>";
            //    }
            //    else {
            //        optHtml += "<option value='" + item.Id + "'>" + item.Name + "</option>";
            //    }
            //});
            //$("#selectAuditCategories").html(optHtml);
            ////binden select
            ////$("#selectAuditCategories").val(audit.IdCat_Meting ? audit.IdCat_Meting : 0);
            ////$("option[value='" + audit.IdCat_Meting + "']", "#selectAuditCategories").prop("selected", true);

            //$("#selectAuditCategories").selectmenu("refresh");
            
            var auditCat = NicModel.StaticData.GetById("Cat_Audits", audit.IdCat_Meting);
            $("#spanAuditCat").text(auditCat? auditCat.Name : "Normaal");
            
            $("#spanAuditTime").text(new Date(audit.DateTime).format("yyyy-MM-dd HH:mm"));
        }
        else if (audit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {
            $(".nicExtra").hide();
            $(".nicPlus").show();
        }

        $("#spanScope").text(audit.Object.ObjectNr);
        //$("#spanCustomer").text(audit.Client.Name);
        //$("#spanSupplier").text(audit.Object.LeverancierNaam);
        $("#spanContractPoints").text(audit.ContractPoints != null ? audit.ContractPoints.toFixed(1) : "");
        //meer buildings?
        var buildingNames = '';
        for (var index in audit.Buildings) {
            var building = audit.Buildings[index];
            buildingNames += building.Name + ' & ';
        }
        buildingNames = buildingNames.substring(0, buildingNames.length - 3);
        $("#spanBuilding").text(buildingNames);
        var auditType = NicModel.StaticData.GetById("Cat_Audits", audit.IdCat_Meting);
        $("#spanAuditType").text(auditType ? auditType.Name : "");

        $("#textboxContactPersonCustomer").val(audit.ClientContactPerson);
        $("#textboxContactPersonSupplier").val(audit.SupplierContactPerson);

        $("#checkboxWithin4Hours").prop("checked", audit.IndBinnen4Uur ? audit.IndBinnen4Uur : false);
        $("#checkboxWithin4Hours").checkboxradio('refresh');

        if (audit.AuditStateId == NicModel.DatabaseIDs.Status.Sent) {

            //voor verzonden metingen is er de mogelijkheid geheime code in te vullen. 
            //als de geheime code klopt dan wordt de status aangepast van 99 naar 9
            //hierna kan dezelfd meting nog een keer worden verzonden
            $("#changeStatusCode").show();
            $("#textboxCodeChangeStatus").change(function () {
                if ($("#textboxCodeChangeStatus").val() == "2468") {
                    audit.AuditStateId = NicModel.DatabaseIDs.Status.Closed;
                    alert("De status is aangepast, zodat u deze meting opnieuw kunt verzenden. Zorg voor de zekerheid dat u het scherm met de handtekeningen NIET opent.");
                }
                else if ($("#textboxCodeChangeStatus").val() != "") {
                    alert("Ongeldige code");
                }
            })
        }
        else {
            $("#changeStatusCode").hide();
            $("#textboxCodeChangeStatus").val("");
        }
        self.attachOnChangeEvents();
    }

    self.save = function () {

        var audit = nicApp.currentAudit;
        
        if ($("#textboxCodeChangeStatus").val() == "2468") {
            audit.AuditStateId = NicModel.DatabaseIDs.Status.Closed;
            alert("De status is aangepast, zodat u deze meting opnieuw kunt verzenden. Zorg voor de zekerheid dat u het scherm met de handtekeningen NIET opent.");
        }
        
        audit.ClientContactPerson = $("#textboxContactPersonCustomer").val();
        audit.SupplierContactPerson = $("#textboxContactPersonSupplier").val();
        audit.IndBinnen4Uur = $("#checkboxWithin4Hours").prop("checked");

        if (!audit.TimeStart) audit.TimeStart = new Date();
        var query = nicApp.db.saveAudit(toJSON(audit));

        var isValid = audit.isValid(false);
        self.isChanged = false;
        //mag wel doorgaan, 
        //als je wilt dat je niet mag doorgaan dan: return isValid;
        //if (audit.AuditStateId >= NicModel.DatabaseIDs.Status.AllRoomsFinished) {
        //    nicApp.showPage("AuditReportPage");
        //}
        //else {
        //    nicApp.showPage("RoomSelectionPage");
        //}
        return isValid;
    }

    self.test = function () {

    }
    return self;
}