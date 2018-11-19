function NicApp() {
    var self = this;
    self.pagesStack = new Array();
    self.db = new NicDB();
    self.loginId = 1;//todo loginid koppelen aan ingelogde persoon
    self.currentAudit = null;
    self.currentAuditRoom = null;
    self.appMessages = [];

    self.pages = [];
    self.pages["HomePage"] = new HomePage();
    self.pages["SyncPage"] = new SyncPage();
    self.pages["AuditSelectionPage"] = new AuditSelectionPage();
    self.pages["AuditDetailsPage"] = new AuditDetailsPage();
    self.pages["RoomSelectionPage"] = new RoomSelectionPage();
    self.pages["RoomDetailsPage"] = new RoomDetailsPage();
    self.pages["FaultTypesPage"] = new FaultTypesPage();
    self.pages["RoomRemarksPage"] = new RoomRemarksPage();
    self.pages["AuditRemarksPage"] = new AuditRemarksPage();
    self.pages["SamplePage"] = new SamplePage();
    self.pages["NotesPage"] = new NotesPage();
    self.pages["FinalReportPage"] = new FinalReportPage();
    self.pages["SignAuditPage"] = new SignAuditPage();
    self.pages["AdvicesPage"] = new AdvicesPage();
    self.pages["CloseAuditPage"] = new CloseAuditPage();
    self.currentPage = null;

    self.showPage = function (newPageName,  cancelSave, showConfirm) {
        var isValid = true;

        if (nicApp.currentAudit && nicApp.currentAudit.AuditStateId == 99) {
            //verzonden items nooit opslaan
            cancelSave = true;
        }
        //bij wisseling van pagina altijd eerst oude opslaan
        //behalve als die via back komt, dan is cancelSave true
        var currentPageName = self.pagesStack[self.pagesStack.length - 1];
        if (currentPageName) {
            var currentPage = self.pages[currentPageName];
            
            //faulttypespage is modaal, dat wil zeggen er is geen anuleer mogelijkheid
            if (currentPage.isModal) {
                isValid = currentPage.save();
            }
            if (isValid && !cancelSave) {
                if (currentPage.isChanged & showConfirm) {
                    if (confirm("Wilt u de gegevens opslaan?")) {
                        if (currentPage.save) {
                            isValid = currentPage.save();
                        }
                    };
                }
                else {
                    if (currentPage.save) {
                        isValid = currentPage.save();
                    }
                }
            }
        }
        if (isValid) {
            $(".page").hide();
            self.pagesStack.push(newPageName);
            self.pages[newPageName].render();
            self.pages[newPageName].show();
            self.currentPage = self.pages[newPageName];
            window.scrollTo(0, 0);
        }
    }

    self.navigateBack = function () {
        if (self.pagesStack.length == 0) {
            nicApp.showPage("HomePage");
            return;
        }

        var currentPageName = self.pagesStack[self.pagesStack.length - 1];
        var currentPage = self.pages[currentPageName];
        var isValid = true;
        //faulttypespage is modaal, dat wil zeggen er is geen anuleer mogelijheid
        if (currentPage.isModal) {
            isValid = currentPage.save();
        }

        //eerst vragen om op te slaan bij wijzigingen
        
        if (currentPage.isChanged) {
            if (confirm("Wilt u de gegevens opslaan?")) {
                if (currentPage.save) {
                    isValid = currentPage.save();
                }
            };
        }
        if (!isValid) return;

        //eentje van de stack halen
        self.pagesStack.pop();
        var prevPageName = self.pagesStack[self.pagesStack.length - 1];
        //als je in ruimte-selectie-pagina zit, met je altijd terug naar metingdetails
        while (currentPageName == "RoomSelectionPage" &&
               prevPageName != "AuditDetailsPage") {
            self.pagesStack.pop();
            prevPageName = self.pagesStack[self.pagesStack.length - 1];
        }
        //als je metingdetails zit, moet je altijd terug naar meting-selectie
        while (currentPageName == "AuditDetailsPage" &&
                   prevPageName != "AuditSelectionPage") {
            self.pagesStack.pop();
            prevPageName = self.pagesStack[self.pagesStack.length - 1];
        }

        if (prevPageName) {
            $(".page").hide();

            self.pages[prevPageName].render();
            self.pages[prevPageName].show();
        }
    }

    self.addMessage = function (msgId, message, isError) {
        self.appMessages[msgId] = { msgId: msgId, message: message, isError: isError };
        self.renderMessages();
        //bij nieuwe melding openklappen
        $("#Messages").collapsible({ collapsed: false });
        window.scrollTo(0, 0);
    }

    self.removeMessage = function (msgId) {
        if (self.appMessages[msgId]) {
            delete self.appMessages[msgId]; // = message;
            self.renderMessages();
        }
    }

    self.lookForStartUpMessages = function () {
        var self = this;
        self.appMessages = [];
        if (!NicModel.StaticData.IsLoaded()) {
            self.addMessage("noStaticData", "Er zijn geen vaste gegevens gevonden op dit apparaat. U dient de statische gegevens te synchroniseren ");
        }
        else {
            self.removeMessage("noStaticData");
        }
        self.db.getAudits().done(function (items) {
            if (items.length <= 0) {
                self.addMessage("noAudits", "Er zijn geen metingen gevonden op dit apparaat. U dient eerst te synchroniseren. ");
            }
            else {
                self.removeMessage("noAudits");
            }
        });
        self.renderMessages();
    }

    self.renderMessages = function () {
        $("#Messages").hide();

        $("#MessagesList").html("");
        for (var msgId in self.appMessages) {
            $("#Messages").show();
            var html = "<li><a href='#'><p>";
            if (this.appMessages[msgId].isError) {
                html += "<span style='color:#900;font-weigth:bold;font-family: Arial Unicode MS, Lucida Grande; font-size:24pt'>&#10008;</span> ";
            }
            else {
                html += "<span style='color:#970;font-weigth:bold;font-family: Arial Unicode MS, Lucida Grande; font-size:24pt'> &#9888</span> ";

            }
            html += self.appMessages[msgId].message + "</p></a>";
            //2015-07-24 HJ van reenen: op verzoek van Rob moeten ook waarschuwing weggeklikt kunnen worden
            //if (self.appMessages[msgId].isError) {
                html += '<a href="#" data-id="' + msgId + '" class="delete">Verwijder</a>';
            //}
            html += '</li>';

            $("#MessagesList").append(html);
        }
        $("#MessagesList").listview("refresh");

        $("#MessagesList a.delete").click(function () {
            var msgId = $(this).attr("data-id");
            self.removeMessage(msgId);
        });
    }

    self.renderMenuTitles = function () {
        if (self.currentAudit) {
            $("#menuTitleAudit").html("Acties bij " + self.currentAudit.Object.Name);
            $("#menuTitleAuditResult").html("Resultaten bij " + self.currentAudit.Object.Name);
        }
    }

    self.renderMenuButtons = function (buttons) {
        if (!buttons) {
            $("#MenuButton").hide();
        }
        else {
            $("#MenuButton").show();
            //self.renderMenuTitles();
            if (buttons.length == 0) return;
            $("#menu button").hide();
            $("#menu div[data-role=collapsible]").hide();

            for (var i in buttons) {
                $("#" + buttons[i], "#menu").show();
                $("#" + buttons[i], "#menu").closest("div[data-role=collapsible]").show();
            }
            $("#menu div[data-role=collapsible]:visible:last").collapsible({ collapsed: false });
        }
    }

    //self.setOKButton = function (action) {
    //    self.commitAction = action;
    //    $("#footer button").hide();
    //    if (action) {
    //        $("#OKButton").show();
    //        $("#OKButton").unbind("click");
    //        $("#OKButton").click(action);
    //    }
    //}

    //self.setBackButton = function (page, commitFunction) {
    //    $("#BackButton").hide();
    //    if (page) {
    //        $("#BackButton").show();
    //        $("#BackButton").unbind("click");
    //        $("#BackButton").click(function () {
    //            nicApp.navigateBack();
    //        });
    //    }
    //}


    $.ajaxSetup({ error: self.ajaxError });

    return self;
}

function Page(formElement, title) {
    var self = this;
    self.formElement = formElement;
    self.title = title;
    self.showMenuButton = true;
    self.showBackButton = true;
    self.menuButtons = [];
    self.isChanged = false;

    self.render = function () {
        $("#title").text(self.title);
        if (self.showMenuButton) {
            $("#MenuButton").show();
            nicApp.renderMenuButtons(self.menuButtons);
        }
        else {
            $("#MenuButton").hide();
        }

        if (self.showBackButton) {
            $("#BackButton").show();
        }
        else {
            $("#BackButton").hide();
        }
        self.isChanged = false;
    }

    self.attachOnChangeEvents = function () {
        var pageId = formElement.attr("id");
        nicApp.pages[pageId].isChanged = false;
        self.formElement.find("input, textarea, select").change(function () {
            //self.isChanged = true;
            var pageId = formElement.attr("id");
            nicApp.pages[pageId].isChanged = true;
        });
    }

    self.show = function () {
        self.formElement.show();
    }

    return self;
}

/////////////////////////////

function HomePage() {
    var page = new Page($("#HomePage"), "Home");
    page.showMenuButton = false;
    page.showBackButton = false;

    var self = $.extend(this, page);

    self.render = function () {
        
        page.render();
        nicApp.lookForStartUpMessages();

    }
    return self;
}



