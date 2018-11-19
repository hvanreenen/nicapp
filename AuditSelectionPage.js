function AuditSelectionPage() {
    var page = new Page($("#AuditSelectionPage"), "Kies meting");
    page.menuButtons = ["SyncButton"];
    var self = $.extend(this, page);


    //self.setOKButton(false);
    //self.setBackButton("HomePage");

    self.render = function () {
        page.render();
        var tableBody = $("tbody", self.formElement);
        tableBody.empty();
        var dbAction = nicApp.db.getAudits();

        if (!NicModel.StaticData.IsLoaded()) {
            $("table", self.formElement).hide();
            nicApp.addMessage("noStaticData", "Er zijn geen vaste gegevens gevonden op dit apparaat. U dient eerst te synchroniseren.");
            return;
        }

        dbAction.done(function (items) {
            if (items.length == 0) {
                $("table", self.formElement).hide();
                nicApp.addMessage("noAudits", "Er zijn geen metingen gevonden op dit apparaat. U dient eerst te synchroniseren om metingen op te halen van de server.");
            }
            else {
                $("table", self.formElement).show();
                Enumerable.From(items).OrderBy("($.Client) ? $.Client.Name: ''").ThenBy("($.Object)? $.Object.Name: ''").ForEach(function (item, index) {
                    //if (item.AuditStateId == 99) {
                    //    item.AuditStateId = 9;
                    //    nicApp.db.saveAudit(toJSON(item));
                    //}
                    var tr = $(document.createElement("tr"));
                    tr.attr("id", item.Id);

                    var td = $(document.createElement("td"));
                    td.text(item.Client ? item.Client.Name : "");
                    tr.append(td);

                    //td = $(document.createElement("td"));
                    //td.text(item.Object ? item.Object.ObjectNr : "");
                    //tr.append(td);

                    td = $(document.createElement("td"));
                    td.text(item.Object ? item.Object.Name + " (" +  item.Object.ObjectNr + ")" : "");
                    tr.append(td);

                    td = $(document.createElement("td"));
                    //todo: uitzoeken: table NICAuditStates geeft states per systeem. Wij moeten hebben voor Nic plus, systemId = 3, maar in deze tabel staat alleen system = 1
                    var status = NicModel.StaticData.GetById("AuditStates", item.AuditStateId);
                    td.text(status != null ? status.Description : "");
                    if (item.AuditStateId == 99) {
                        //verzonden zit niet in de db
                        td.text("Verzonden");
                    }
                    tr.append(td);

                    td = $(document.createElement("td"));
                    var auditType = NicModel.StaticData.GetById("NICAuditSystems", item.NICAuditSystemId);
                    td.text(auditType.Description);
                    tr.append(td);

                    td = $(document.createElement("td"));
                    td.text(new Date(item.DateTime).format("dd-mm-yyyy HH:MM"));
                    tr.append(td);

                    var address = "";
                    if (item.Object) {
                        address = item.Object.AddressStreet + " " + item.Object.AddressNumber + item.Object.AddressNumberAdd + ", ";
                        address += item.Object.ZipCode + ", " + item.Object.Town;
                    }
                    td = $(document.createElement("td"));
                    td.text(address);
                    tr.append(td);

                    //tijdelijk uitgezet want meting moet opnieuw berekend
                    //if (item.AuditStateId == NicModel.DatabaseIDs.Status.Closed) {
                    if (1 == 0) {
                        tr.attr('disabled', 'disabled');
                        tr.css('color', '#aaa');
                    }
                    else {
                        tr.bind("click", function () {
                            var id = $(this).attr("id");
                            id = parseInt(id);
                            $("#menuPanelAuditSpecific").show();
                            $("#menuPanelAuditSpecific").collapsible({
                                collapsed: false
                            });
                            self.openAuditDetailsPage(id);

                        });
                    }
                    tableBody.append(tr);
                });
            }
        });
    }

    self.openAuditDetailsPage = function (id) {
        var query = nicApp.db.getAudit(id);
        query.done(function (audit) {
            nicApp.currentAudit = $.extend(new NicModel.Audit(), audit);
            nicApp.showPage("AuditDetailsPage");
        });
    }

    return self;
}
