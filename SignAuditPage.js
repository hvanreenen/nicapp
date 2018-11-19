SignAuditPage = function () {
    var page = new Page($("#SignAuditPage"), "Ondertekenen");
    var self = $.extend(this, page);

    self.render = function () {
        page.render();
        $("#canvasSignatureClient", self.formElement).sketchpad({ penColor: "black", dataURL: nicApp.currentAudit.SignatureClient, bgColor: "White" });
        $("#canvasSignatureSupplier", self.formElement).sketchpad({ penColor: "black", dataURL: nicApp.currentAudit.SignatureSupplier, bgColor: "White" });
        $("#canvasSignatureInspector", self.formElement).sketchpad({ penColor: "black", dataURL: nicApp.currentAudit.SignatureInspector, bgColor: "White" });

        $("#textReasonNoSignClient", self.formElement).hide();
        $("#checkboxNoSignClient", self.formElement).prop("checked", nicApp.currentAudit.NoSignClient);
        if (nicApp.currentAudit.NoSignClient) {
            $("#textReasonNoSignClient", self.formElement).show();
            $("#textReasonNoSignClient", self.formElement).val(nicApp.currentAudit.HandKlantOpm);
        }
        $("#checkboxNoSignClient").checkboxradio('refresh');

        $("#textReasonNoSignSupplier", self.formElement).hide();
        $("#checkboxNoSignSupplier", self.formElement).prop("checked", nicApp.currentAudit.NoSignSupplier);
        if (nicApp.currentAudit.NoSignSupplier) {
            $("#textReasonNoSignSupplier", self.formElement).show();
            $("#textReasonNoSignSupplier", self.formElement).val(nicApp.currentAudit.HandLevOpm);
        }
        $("#checkboxNoSignSupplier").checkboxradio('refresh');

        $("input[type=reset]", self.formElement).click(function () {
            var type = $(this).attr("data-type");
            var canvas = $("#canvasSignature" + type);
            var settings = { penColor: "black", dataURL: "", bgColor: "White" };
            canvas.sketchpad(settings);
        });

        $("#checkboxNoSignClient").unbind("click");
        $("#checkboxNoSignClient", self.formElement).click(function () {
            var checked = $("#checkboxNoSignClient").is(":checked");
            if (checked) {
                $("#textReasonNoSignClient").show();
                var canvas = $("#canvasSignatureClient");
                var settings = { penColor: "black", dataURL: "", bgColor: "White" };
                canvas.sketchpad(settings);
            }
            else {
                $("#textReasonNoSignClient").hide();
                $("#textReasonNoSignClient").val('');
            }
        });

        $("#checkboxNoSignSupplier").unbind("click");
        $("#checkboxNoSignSupplier", self.formElement).click(function () {
            var checked = $("#checkboxNoSignSupplier").is(":checked");
            if (checked) {
                $("#textReasonNoSignSupplier").show();
                var canvas = $("#canvasSignatureSupplier");
                var settings = { penColor: "black", dataURL: "" };
                canvas.sketchpad(settings);
            }
            else {
                $("#textReasonNoSignSupplier").hide();
                $("#textReasonNoSignSupplier").val('');
            }
        });


    }

    self.save = function () {
        nicApp.currentAudit.SignatureClient = $("#canvasSignatureClient")[0].toDataURL("image/png");
        nicApp.currentAudit.SignatureSupplier = $("#canvasSignatureSupplier")[0].toDataURL("image/png");
        nicApp.currentAudit.SignatureInspector = $("#canvasSignatureInspector")[0].toDataURL("image/png");

        nicApp.currentAudit.NoSignClient = $("#checkboxNoSignClient").is(":checked");
        nicApp.currentAudit.NoSignSupplier = $("#checkboxNoSignSupplier").is(":checked");
        nicApp.currentAudit.HandKlantOpm = $("#textReasonNoSignClient").val();
        nicApp.currentAudit.HandLevOpm = $("#textReasonNoSignSupplier").val();
            

        var test = nicApp.currentAudit.SignatureSupplier.length;
        var isValid = true;

        nicApp.removeMessage("reasonNoSignatureClientRequired" + nicApp.currentAudit.Id);
        nicApp.removeMessage("reasonNoSignatureSupplierRequired" + nicApp.currentAudit.Id);
        nicApp.removeMessage("noValidSignatureClient" + nicApp.currentAudit.Id);
        nicApp.removeMessage("noValidSignatureSupplier" + nicApp.currentAudit.Id);
        nicApp.removeMessage("noValidSignatureInspector" + nicApp.currentAudit.Id);
        if (nicApp.currentAudit.NoSignClient && !nicApp.currentAudit.HandKlantOpm) {
            nicApp.addMessage("reasonNoSignatureClientRequired" + nicApp.currentAudit.Id, "Reden niet ondertekenen is verplicht bij klant.");
            isValid = false;
        }
        if (!nicApp.currentAudit.NoSignClient && nicApp.currentAudit.SignatureClient.length < 100) {
            nicApp.addMessage("noValidSignatureClient" + nicApp.currentAudit.Id, "Kon niet opslaan. Ondertekenen door klant is verplicht.")
            isValid = false;
        }
        if (nicApp.currentAudit.NoSignSupplier && !nicApp.currentAudit.HandLevOpm) {
            nicApp.addMessage("reasonNoSignatureSupplierRequired" + nicApp.currentAudit.Id, "Reden niet ondertekenen is verplicht bij aannemer.");
            isValid = false;
        }
        if (!nicApp.currentAudit.NoSignSupplier && nicApp.currentAudit.SignatureSupplier.length < 100) {
            nicApp.addMessage("noValidSignatureSupplier" + nicApp.currentAudit.Id, "Kon niet opslaan. Ondertekenen door aannemer is verplicht.")
            isValid = false;
        }
        if (nicApp.currentAudit.SignatureInspector.length < 100) {
            nicApp.addMessage("noValidSignatureInspector" + nicApp.currentAudit.Id, "Kon niet opslaan. Ondertekenen door inspecteur is verplicht.")
            isValid = false;
        }

        if (isValid) {
            nicApp.currentAudit.AuditStateId = NicModel.DatabaseIDs.Status.Signed;
            nicApp.db.saveAudit(toJSON(nicApp.currentAudit));
            self.menuButtons = ["AuditDetailsButton", "AuditRoomsButton", "AuditSampleButton", "AuditRemarksButton", "AuditNotesButton", "AuditReportButton", "AuditSignButton", "AuditAdviceButton", "AuditCloseButton"];
            nicApp.renderMenuButtons();

        }
        return isValid;
    }

    return self;
}