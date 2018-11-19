AdvicesPage = function () {
    var page = new Page($("#AdvicesPage"), "Adviezen");
    var self = $.extend(this, page);

    self.render = function () {
        page.render();
        var divRoot = $("#advicesTree");
        divRoot.empty();

        if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
            self.renderAdvicesPage_NicExtra(divRoot);
        }
        else {
            self.renderAdvicesPage_NicPlus(divRoot);
        }

        $(divRoot).collapsibleset();
        $(divRoot).find("input[type=checkbox]").checkboxradio({ defaults: true });
        $(divRoot).find("input[type=text]:visible").textinput();
        //regels code om te zorgen dat op mobiele devices keyboard verwijnt na klik op 'ga'
        $(divRoot).find("input[type=text]").keypress(function (ev) {
            if (event.which == 13) {
                $(this).blur();
            }
        });

        self.attachOnChangeEvents();

    }

    self.renderAdvicesPage_NicPlus = function (divRoot) {
        var divMainChapter;

        Enumerable.From(NicModel.StaticData.ResultCategories).OrderBy("$.Number").ForEach(function (item, index) {
            var chapter = item;

            var divChapter = $(document.createElement("div"));
            divChapter.attr("data-role", "collapsible");
            divChapter.html("<h4>" + chapter.Description + "</h4>");

            var level = chapter.Ind_Categorie;

            var where = "$.ResultCategoryId == " + chapter.Id;
            Enumerable.From(NicModel.StaticData.ResultDescriptions).Where(where).OrderBy("$.Description").ForEach(function (item, index) {
                var advice = item;

                var html = "<label><input id='checkboxAuditAdvice_" + advice.Id + "' name='" + advice.Id + "' type='checkbox' onclick='javascript:nicApp.pages[\"AdvicesPage\"].showTextBoxAuditAdvice(" + advice.Id + ");'/>" + advice.Description;
                html += "</label>";
                html += "<input type='text' style='display:none' id='textAuditAdvice_" + advice.Id + "' placeholder= 'eventuele extra opmerkingen...'/>";

                //als deze checklist voor de tweede keer wordt geladen dan binden aan reeds bestaande data.
                var itemFoundInArray = findInArray(nicApp.currentAudit.NICAuditFaults, "NICResultDescriptionId", item.Id);
                if (itemFoundInArray) {
                    html = "<label><input id='checkboxAuditAdvice_" + advice.Id + "' name='" + advice.Id + "' type='checkbox' checked='checked'/>" + advice.Description;
                    html += "</label>";
                    html += "<input type='text' id='textAuditAdvice_" + advice.Id + "' value='" + itemFoundInArray.Description + "' placeholder= 'eventuele extra opmerkingen...'/>";
                }

                divChapter.append(html);
                if (itemFoundInArray) {
                    $("#textAuditAdvice_" + advice.Id).textinput();
                }

            });
            if (level == 1) {
                divRoot.append(divChapter);
                divMainChapter = divChapter;
            }
            else if (level == 2) {
                divMainChapter.append(divChapter);
            }
        });
    }

    self.renderAdvicesPage_NicExtra = function (divRoot) {
        //bij nic extra alleen twee blokjes tonen
        //blok 1 verzamelde adviezen voor klant
        //blok 2 verzamelde adviezen voor leverancier

        var divChapter1 = $(document.createElement("div"));
        divChapter1.attr("data-role", "collapsible");
        divChapter1.html("<h4>Advies klant</h4>");

        var where = "$.Kind == 4";
        Enumerable.From(NicModel.StaticData.FaultTypes).Where(where).OrderBy("$.Description").ForEach(function (item, index) {
            var faultType = item;

            var html = "<label><input id='checkboxAuditAdvice_" + faultType.Id + "' name='" + faultType.Id + "' type='checkbox' onclick='javascript:nicApp.pages[\"AdvicesPage\"].showTextBoxAuditAdvice(" + faultType.Id + ");'/>" + faultType.Description;
            html += "</label>";
            html += "<input type='text' style='display:none' id='textAuditAdvice_" + faultType.Id + "' placeholder= 'eventuele extra opmerkingen...'/>";

            //als deze checklist voor de tweede keer wordt geladen dan binden aan reeds bestaande data.
            var itemFoundInArray = findInArray(nicApp.currentAudit.NICAuditFaults, "NICFaultTypeId", item.Id);
            if (itemFoundInArray) {
                html = "<label><input id='checkboxAuditAdvice_" + faultType.Id + "' name='" + faultType.Id + "' type='checkbox' checked='checked' onclick='javascript:nicApp.pages[\"AdvicesPage\"].showTextBoxAuditAdvice(" + faultType.Id + ");'/>" + faultType.Description;
                html += "</label>";
                html += "<input type='text' id='textAuditAdvice_" + faultType.Id + "' value='" + itemFoundInArray.Remark + "' placeholder= 'eventuele extra opmerkingen...'/>";

            }
            divChapter1.append(html);
            if (itemFoundInArray) {
                divChapter1.find("#textAuditAdvice_" + faultType.Id).textinput();
            }
        });

        //tweede hoofdstuk
        var divChapter2 = $(document.createElement("div"));
        divChapter2.attr("data-role", "collapsible");
        divChapter2.html("<h4>Advies leverancier</h4>");

        var where = "$.Kind == 5"
        Enumerable.From(NicModel.StaticData.FaultTypes).Where(where).OrderBy("$.Description").ForEach(function (item, index) {
            var faultType = item;

            var html = "<label><input id='checkboxAuditAdvice_" + faultType.Id + "' name='" + faultType.Id + "' type='checkbox' onclick='javascript:nicApp.pages[\"AdvicesPage\"].showTextBoxAuditAdvice(" + faultType.Id + ");'/>" + faultType.Description;
            html += "</label>";
            html += "<input type='text' style='display:none' id='textAuditAdvice_" + faultType.Id + "' placeholder= 'eventuele extra opmerkingen...'/>";

            //als deze checklist voor de tweede keer wordt geladen dan binden aan reeds bestaande data.
            var itemFoundInArray = findInArray(nicApp.currentAudit.NICAuditFaults, "NICFaultTypeId", item.Id);
            if (itemFoundInArray) {
                html = "<label><input id='checkboxAuditAdvice_" + faultType.Id + "' name='" + faultType.Id + "' type='checkbox' checked='checked'/>" + faultType.Description;
                html += "</label>";
                html += "<input type='text' id='textAuditAdvice_" + faultType.Id + "' value='" + itemFoundInArray.Remark + "' placeholder= 'eventuele extra opmerkingen...'/>";

            }
            divChapter2.append(html);
            if (itemFoundInArray) {
                divChapter2.find("#textAuditAdvice_" + faultType.Id).textinput();
            }

        });

        divRoot.append(divChapter1);
        divRoot.append(divChapter2);
    }

    self.renderAdvicesPage_NicExtra_old = function (divRoot) {
        //IN _old keken we naar de Resultaatomschrijving tabel net als bij nicplus. 
        //blijkt dat in NICFoutsoort dezelfde omschrijvingen staan en dat deze moet worden gebruikt voor NICEXTra
        //bij nic extra alleen twee blokjes tonen
        //blok 1 verzamelde adviezen voor klant
        //blok 2 verzamelde adviezen voor leverancier

        var divChapter1 = $(document.createElement("div"));
        divChapter1.attr("data-role", "collapsible");
        divChapter1.html("<h4>Advies Klant</h4>");

        var where = "($.ResultCategoryId == 4 || $.ResultCategoryId == 7 || $.ResultCategoryId == 10)";
        Enumerable.From(NicModel.StaticData.ResultDescriptions).Where(where).OrderBy("$.Description").ForEach(function (item, index) {
            var advice = item;

            var html = "<label><input id='checkboxAuditAdvice_" + advice.Id + "' name='" + advice.Id + "' type='checkbox' onclick='javascript:nicApp.pages[\"AdvicesPage\"].showTextBoxAuditAdvice(" + advice.Id + ");'/>" + advice.Description;
            html += "</label>";
            html += "<input type='text' style='display:none' id='textAuditAdvice_" + advice.Id + "' placeholder= 'eventuele extra opmerkingen...'/>";

            //als deze checklist voor de tweede keer wordt geladen dan binden aan reeds bestaande data.
            var itemFoundInArray = findInArray(nicApp.currentAudit.NICAuditFaults, "NICResultDescriptionId", item.Id);
            if (itemFoundInArray) {
                html = "<label><input id='checkboxAuditAdvice_" + advice.Id + "' name='" + advice.Id + "' type='checkbox' checked='checked'/>" + advice.Description;
                html += "</label>";
                html += "<input type='text' id='textAuditAdvice_" + advice.Id + "' value='" + itemFoundInArray.Description + "' placeholder= 'eventuele extra opmerkingen...'/>";

            }
            divChapter1.append(html);
            if (itemFoundInArray) {
                $("#textAuditAdvice_" + advice.Id).textinput();
            }
        });

        //tweede hoofdstuk
        var divChapter2 = $(document.createElement("div"));
        divChapter2.attr("data-role", "collapsible");
        divChapter2.html("<h4>Advies leveranciers</h4>");

        where = "($.ResultCategoryId == 3 || $.ResultCategoryId == 6 || $.ResultCategoryId == 9)";
        Enumerable.From(NicModel.StaticData.ResultDescriptions).Where(where).OrderBy("$.Description").ForEach(function (item, index) {
            var advice = item;

            var html = "<label><input id='checkboxAuditAdvice_" + advice.Id + "' name='" + advice.Id + "' type='checkbox' onclick='javascript:nicApp.pages[\"AdvicesPage\"].showTextBoxAuditAdvice(" + advice.Id + ");'/>" + advice.Description;
            html += "</label>";
            html += "<input type='text' style='display:none' id='textAuditAdvice_" + advice.Id + "' placeholder= 'eventuele extra opmerkingen...'/>";

            //als deze checklist voor de tweede keer wordt geladen dan binden aan reeds bestaande data.
            var itemFoundInArray = findInArray(nicApp.currentAudit.NICAuditFaults, "NICResultDescriptionId", item.Id);
            if (itemFoundInArray) {
                html = "<label><input id='checkboxAuditAdvice_" + advice.Id + "' name='" + advice.Id + "' type='checkbox' checked='checked'/>" + advice.Description;
                html += "</label>";
                html += "<input type='text' id='textAuditAdvice_" + advice.Id + "' value='" + itemFoundInArray.Description + "' placeholder= 'eventuele extra opmerkingen...'/>";

            }
            divChapter2.append(html);
            if (itemFoundInArray) {
                $("#textAuditAdvice_" + advice.Id).textinput();
            }

        });

        divRoot.append(divChapter1);
        divRoot.append(divChapter2);
    }

    self.showTextBoxAuditAdvice = function (id) {
        var isVisible = $("#checkboxAuditAdvice_" + id).is(":checked");
        if (isVisible) {
            $("#textAuditAdvice_" + id).show();
            $("#textAuditAdvice_" + id).textinput();

        }
        else {
            $("#textAuditAdvice_" + id).val("");
            $("#textAuditAdvice_" + id).hide();
            //om te voorkomen dat textbox als horizontale lijn wordt weergegeven: destroy
            $("#textAuditAdvice_" + id).textinput("destroy");
        }
    }

    self.save = function () {
        var audit = nicApp.currentAudit;
        var isValid = true;

        if (!audit.NICAuditFaults) auditRoom.NICAuditFaults = [];
        //tabel NICAuditFault wordt gebruikt voor zowel adviezen als voor algemene opmerkingen 
        //eerst copieren we alle opmerkingen in een tijdelijke list, 
        //De adviezen laten we ongemoeid, zodat deze hieronder opnieuw vers kunnen toevoegen aan deze lijst
        var tempArray = [];
        for (var i in audit.NICAuditFaults) {
            var fault = audit.NICAuditFaults[i];
            //als NICFaultTypeId is gevuld dan is het een opmerking
            if (fault.Type == "Remark")
                tempArray.push(fault);
        }
        //deze tijdelijke list zetten we nu in audit
        audit.NICAuditFaults = tempArray;
        //hierna halen we de adviezen uit de checkbox list en voegen die toe
        $('#advicesTree input:checked').each(function () {
            var adviceId = $(this).attr("name");
            var nicAuditFault = new Object();
            nicAuditFault.Id = generateUUID();
            nicAuditFault.NICAuditId = audit.Id;
            nicAuditFault.Type = "Advice";
            if (nicApp.currentAudit.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {

                nicAuditFault.NICFaultTypeId = parseInt(adviceId);
                nicAuditFault.Remark = $("#textAuditAdvice_" + adviceId).val();

            }
            else {

                nicAuditFault.NICResultDescriptionId = parseInt(adviceId);
                nicAuditFault.Description = $("#textAuditAdvice_" + adviceId).val();

            }
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

    return self;
}