SyncPage = function () {
    var page = new Page($("#SyncPage"), "Synchroniseren");
    page.showMenuButton = false;
    var self = $.extend(this, page);

    //self.setMenuButtons(["SyncButton"]);
    //self.setOKButton(false);
    //self.setBackButton("HomePage");

    self.render = function () {
        page.render();
        //$("#syncLog").text("");
        var countFinishedAudits = 0;
        var dbAction = nicApp.db.getAudits();

        dbAction.done(function (items) {
            countFinishedAudits = Enumerable.From(items).Where("$.AuditStateId == " + NicModel.DatabaseIDs.Status.Closed).Count();
            $("#SyncFinishedAuditsButton").text("Verzenden afgeronde metingen (" + countFinishedAudits + ")...");
            $("#SyncFinishedAuditsButton").prop('disabled', (countFinishedAudits <= 0));

            countSentAudits = Enumerable.From(items).Where("$.AuditStateId == " + NicModel.DatabaseIDs.Status.Sent).Count();
            $("#DeleteSentAuditsButton").text("Verwijderen verzonden metingen (" + countSentAudits + ")...");
            $("#DeleteSentAuditsButton").prop('disabled', (countSentAudits <= 0));

        });

        if (applicationCache.status == 1) {
            applicationCache.update();
        }
        $("#SyncStaticDataButton").unbind("click");
        $("#SyncStaticDataButton").click(function () {
            $("#syncLog").text("");
            nicApp.db.initialSync(function () {
                $.mobile.loading("hide");
                nicApp.lookForStartUpMessages();
            });
        });

        $("#DeleteAuditsButton").unbind("click");
        $("#DeleteAuditsButton").click(function () {
            $("#syncLog").text("");
            nicApp.db.emptyAudits(function () {
                $("#syncLog").text("Metingen verwijderd.");
                $.mobile.loading("hide");
                nicApp.appMessages = [];
                nicApp.lookForStartUpMessages();
            });
        });

        $("#SyncNewAuditsButton").unbind("click");
        $("#SyncNewAuditsButton").click(function () {
            $("#syncLog").text("");
            nicApp.db.fillAudits(nicApp.loginId, function () {
                $.mobile.loading("hide");
                nicApp.lookForStartUpMessages();
            });
        });

        $("#SyncFinishedAuditsButton").unbind("click");
        $("#SyncFinishedAuditsButton").click(function () {
            $("#syncLog").text("");
            $("#SyncFinishedAuditsButton").attr("disabled", "disabled");
            nicApp.db.sendFinishedAudits(function () {
                $.mobile.loading("hide");
                nicApp.lookForStartUpMessages();
                $("#SyncFinishedAuditsButton").removeAttr("disabled");
            });
        });

        $("#DeleteSentAuditsButton").unbind("click");
        $("#DeleteSentAuditsButton").click(function () {
            $("#syncLog").text("");
            nicApp.db.deleteSentAudits(function () {
                $.mobile.loading("hide");
                nicApp.lookForStartUpMessages();
            });
        });
        

        $("#SyncAllButton").unbind("click");
        $("#SyncAllButton").click(function () {
            $("#syncLog").text("");

            nicApp.db.syncAll(function () {
                $.mobile.loading("hide");
                nicApp.lookForStartUpMessages();
            });
        });

        $("#DebugAuditsButton").unbind("click");
        $("#DebugAuditsButton").click(function () {
            $("#syncLog").text("");

            nicApp.db.fillDebugAudit(function () {
                $.mobile.loading("hide");
                nicApp.lookForStartUpMessages();
            });
        });
        
    }


    return self;
}