NotesPage = function () {
    var page = new Page($("#NotesPage"), "Kladblok & aantekeningen");
    var self = $.extend(this, page);

    //self.setMenuButtons(["SyncButton"]);
    //self.setOKButton(false);
    //self.setBackButton("HomePage");

    self.render = function () {
        page.render();
        if (!nicApp.currentAudit) {
            nicApp.addMessage("noCurrentAudit", "Kies eerst een meting voordat u aantekeningen kunt opslaan.");
            return;
        }
        else {
            nicApp.removeMessage("noCurrentAudit");
            $("#spanCurrentAudit").text(nicApp.currentAudit.toString());

            $("#textareaNotes").val(nicApp.currentAudit.Note ? nicApp.currentAudit.Note : "");
            $("#textareaRemarks").val(nicApp.currentAudit.Remark ? nicApp.currentAudit.Remark : "");
        }

        $("#SaveNotesButton").unbind("click");
        $("#SaveNotesButton").click(function () {
            self.save();
            nicApp.navigateBack();
        });

        self.attachOnChangeEvents();
    }

    self.save = function () {
        var isValid = true;
        //todo uitzoeken waar in database kladblok moet worden opgeslagen
        var notes = $("#textareaNotes").val();
        var remark = $("#textareaRemarks").val();
        if (notes.indexOf('|') >= 0) {
            nicApp.addMessage("noPipesAllowedInNotes", "Kan niet opslaan, want het teken '|' is niet toegestaan in een kladblok aantekening.")
            isValid = false;
        }
        else {
            nicApp.removeMessage("noPipesAllowedInNotes");
        }
        if (remark.indexOf('|') >= 0) {
            nicApp.addMessage("noPipesAllowedInRemark", "Kan niet opslaan, want het teken '|' is niet toegestaan in een opmerking.")
            isValid = false;
        }
        else {
            nicApp.removeMessage("noPipesAllowedInRemark");
        }

        if (isValid) {
            nicApp.currentAudit.Note = $("#textareaNotes").val();
            nicApp.currentAudit.Remark = $("#textareaRemarks").val();

            nicApp.db.saveAudit(toJSON(nicApp.currentAudit));

            self.isChanged = false;
        }
        return isValid;
    }

    return self;
}