CloseAuditPage = function () {
    var page = new Page($("#CloseAuditPage"), "Meting afsluiten");
    var self = $.extend(this, page);

    //self.setMenuButtons(["SyncButton"]);
    //self.setOKButton(false);
    //self.setBackButton("HomePage");

    self.render = function () {
        page.render();
        var isValid = nicApp.currentAudit.isValid(true);

        if (!isValid) {
            $("div#closeAuditMsg", self.formElement).html("U kunt de meting nog niet afsluiten. Corrigeer svp eerst de fouten.");
            $("#CloseAuditButton", self.formElement).hide();
        }
        else {
            $("div#closeAuditMsg").html("U bent aan het einde gekomen van de meting.<br /><br /><b>Wilt u de meting afsluiten? Hierna is die niet meer te openen.</b>");
            $("#CloseAuditButton", self.formElement).show();
        }

        $("#CloseAuditButton").click(function () {
            nicApp.currentAudit.close();

            nicApp.showPage("HomePage");
        });

        $("#Cancel_CloseAuditButton").click(function () {
            nicApp.showPage("AuditDetailsPage");
            nicApp.pagesStack = [];
        });
    }

    return self;
}