function NicDB() {
    var schema = {
        stores: [{
            name: 'NIC.Audit',
            keyPath: "Id"
        },
        {
            name: 'NIC.Element',
            keyPath: "Id"
        },
        {
            name: 'NIC.RoomCategory',
            keyPath: 'Id'
        },
        {
            name: 'NIC.RoomCategoryElement',
            keyPath: "Id"
            // ydn-db (indexeddb) kan niet omgaan met compound primary keys.
            // hierom wordt in c# partial class RoomCategoryElement.cs zelf unieke sleutel gemaakt van de 2 keys uit de database
            //werkt niet: keyPath: ["RoomCategoryId", "ElementId"]
        },
        {
            name: "NIC.NICPlusCategory",
            keyPath: "Id"
        },
        {
            name: "NIC.NICRCNICPlus",
            keyPath: "Id",
            indexes:
                [{
                    keyPath: "NICPlusCategoryId"
                },
                {
                    keyPath: "RoomCategoryId"
                }]
        },
        {
            name: "NIC.FaultType",
            keyPath: "Id"
        },
        {
            name: "NIC.ResultDescription",
            keyPath: "Id"
        },
        {
            name: "NIC.RoomResultDescription",
            keyPath: "Id"
        },
        {
            name: "NIC.Result",
            keyPath: "Id"
        },
        {
            name: "NIC.NICAuditSystem",
            keyPath: "Id"
        },
        {
            name: "NIC.AuditState",
            keyPath: "Id"
        },
        {
            name: "NIC.BuildingCategory",
            keyPath: "Id"
        },
        {
            name: "NIC.NICAuditSampleSize",
            keyPath: "Id"
        },
        {
            name: "NIC.Cat_Audit",
            keyPath: "Id"
        },
        {
            name: "NIC.MinusPoint",
            keyPath: "Id"
        },
        {
            name: "NIC.RoomResultDescription",
            keyPath: "Id"
        },
        {
            name: "NIC.ResultCategory",
            keyPath: "Id"
        }]
    };
    var options =
    {
        mechanisms: [
            "websql",
            "indexeddb"
        ]
    }

    this.db = new ydn.db.Storage('NICDB', schema, options);
    //	ydn.debug.log('ydn.db', 'finest');

    this.StaticData = {};

    this.staticDataTableMappings = [
        { TableName: "NIC.Element", ObjectName: "Elements" },
        { TableName: "NIC.RoomCategory", ObjectName: "RoomCategories" },
        { TableName: "NIC.RoomCategoryElement", ObjectName: "RoomCategoryElements" },
        { TableName: "NIC.FaultType", ObjectName: "FaultTypes" },
        { TableName: "NIC.ResultDescription", ObjectName: "ResultDescriptions" },
        { TableName: "NIC.RoomResultDescription", ObjectName: "RoomResultDescriptions" },
        { TableName: "NIC.NICPlusCategory", ObjectName: "NICPlusCategories" },
        { TableName: "NIC.NICRCNICPlus", ObjectName: "NICRCNICPlus" },
        { TableName: "NIC.Result", ObjectName: "Results" },
        { TableName: "NIC.NICAuditSystem", ObjectName: "NICAuditSystems" },
        { TableName: "NIC.AuditState", ObjectName: "AuditStates" },
        { TableName: "NIC.BuildingCategory", ObjectName: "BuildingCategories" },
        { TableName: "NIC.NICAuditSampleSize", ObjectName: "NICAuditSampleSizes" },
        { TableName: "NIC.Cat_Audit", ObjectName: "Cat_Audits" },
        { TableName: "NIC.MinusPoint", ObjectName: "MinusPoints" },
        { TableName: "NIC.RoomResultDescription", ObjectName: "RoomResultDescriptions" },
        { TableName: "NIC.ResultCategory", ObjectName: "ResultCategories" }
    ];


    /////////////////////
    ///SYNC ACTIES
    /////////////////////
    this.initialSync = function (readyFunction) {
        $("#message").html("");
        $.mobile.loading("show", {
            text: "Synchroniseren statische gegevens...",
            textVisible: true
        });
        $.mobile.loading("show", { text: "Verwijderen statische gegevens...", textVisible: true });
        this.emptyStaticData(function () {
            var text = "Verwijderen statische gegevens geslaagd. <br/>";
            $("#syncLog").append(text);
            $.mobile.loading("show", { text: "Ophalen statische gegevens...", textVisible: true });
            self.fillStaticData(function () {
                var text = "Ophalen statische gegevens geslaagd. <br/>";
                $("#syncLog").append(text);
                $.mobile.loading("show", { text: "Laden statische gegevens...", textVisible: true });
                self.loadStaticData(function () {
                    var text = "Laden statische gegevens geslaagd. <br/>";
                    $("#syncLog").append(text);

                    if (readyFunction) readyFunction();
                });
            });
        });
    }

    this.emptyStaticData = function (readyFunction) {
        var countDone = 0;
        for (var i in this.staticDataTableMappings) {
            var mapping = this.staticDataTableMappings[i];

            self.db.clear(mapping.TableName).done(function () {
                countDone++;
                if (countDone == self.staticDataTableMappings.length) {
                    if (readyFunction) readyFunction();
                }
            }).fail(function (error) {
                alert(error.message);
                countDone++;
                if (countDone == self.staticDataTableMappings.length) {
                	if (readyFunction) readyFunction();
                }
            });
        }

    }

    this.fillStaticData = function (readyFunction) {
        var self = this;
        $.ajax({
            url: getStaticDataUrl, type: "POST", success: function (result) {
                var countDone = 0;
                for (var i in self.staticDataTableMappings) {
                    var mapping = self.staticDataTableMappings[i];
                    if (mapping.ObjectName == "FaultTypes") {
                        var debug = true;
                    }
                    self.db.put(mapping.TableName, result[mapping.ObjectName]).done(function () {
                        countDone++;
                        if (countDone == self.staticDataTableMappings.length) {
                            if (readyFunction) readyFunction();
                        }
                    }).fail(function (err) {
                        throw err;
                    });;
                }



            }
        })
    }

    this.emptyAudits = function (readyFunction) {
        self.db.clear('NIC.Audit').done(function () {
            if (readyFunction) readyFunction();
        });
    }

    this.fillAudits = function (loginId, readyFunction) {
        $("#message").html("");
        $.mobile.loading("show", {
            text: "Synchroniseren metingen...",
            textVisible: true
        });
        // Haal de keys op van de metingen die al in de database zitten
        var self = this;
        self.db.keys('NIC.Audit').done(function (keys) {
            //laad gegevens van server en stop in locale DB
            $.ajax({
            	url: getAuditsUrl, type: "POST", timeout: 5 * 60 * 1000, data: { keys: keys }, dataType: "text",
            	success: function (json) {
            		var data = JSON.parse(json, nicApp.dateReviver);
            		data = self.addExtraEmptyFields(data);
                    self.db.put('NIC.Audit', data).fail(function (err) {
                        throw err;
                    }).done(function (items) {
                        var text = "Synchroniseren geslaagd. Er zijn " + items.length + " nieuwe metingen opgehaald.<br/>";
                        if (items.length == 0) {
                            text = "Er zijn geen nieuwe metingen.<br/>";
                        }
                        else if (items.length == 1) {
                            text = "Synchroniseren geslaagd. Er is 1 nieuwe meting opgehaald.<br/>";
                        }
                        $("#syncLog").append(text);
                        if (readyFunction) readyFunction();
                    });
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    var errMsg = xhr.responseText.match("<title>(.*?)</title>")[1];
                    var text = "<span class='validationMsg'>Synchroniseren niet geslaagd. Er zijn fouten opgetreden bij het ophalen van nieuwe metingen: " + thrownError + " " + errMsg + "</span><br/> ";
                    $("#syncLog").append(text);
                    $.mobile.loading("hide");
                }
            });
        })
    }

    this.addExtraEmptyFields = function (auditList) {
        //mogelijke bugfix voor bug dat bij wissel tussen audits onderstaande velden niet goed worden gerefreshed
        for (var i in auditList) {
            var audit = auditList[i];
            audit.Note = '';
            audit.Remark = '';
            audit.SignatureClient = '';
            audit.SignatureSupplier = '';
            audit.SignatureInspector = '';
        }
        return auditList;
    }

    this.sendFinishedAudits = function (readyFunction) {
        var self = this;
        $.mobile.loading("show", {
            text: "Versturen metingen...",
            textVisible: true
        });
        this.db.values("NIC.Audit").done(function (result) {
        	var auditsToSend = Enumerable.From(result).Where("$.AuditStateId==9");
            if (auditsToSend.Count() == 0) {
                if (readyFunction) readyFunction();
            }
            auditsToSend.ForEach(function (item, index) {

                //mag niet leeg zijn
                if (!item.IndOnvoldoendeM2) item.IndOnvoldoendeM2 = 0;
                //moet 1 en 0 bevatten ipv true en false
                item.IndBinnen4Uur = (item.IndBinnen4Uur) ? 1 : 0;
                item.finalResults = null;
                item.AllRooms = null;
               
                
                //moet koppeltabel vullen gebouw met metingen
                item.NICAuditBuildings = [];
                for(var i in item.Buildings){
                    var building = item.Buildings[i];
                    building.NICAuditBuildings = [];
                    var nicAuditBuilding = new Object();
                    nicAuditBuilding.Id = generateUUID();
                    nicAuditBuilding.BuildingId = building.Id;
                    nicAuditBuilding.NICAuditId = item.Id;
                    item.NICAuditBuildings.push(nicAuditBuilding);
                }

                item.AcceptanceBoundaries = null;
                
                //kladblok en opmerkingen samenvoegen in 1 veld
                item.Remarks = item.Note ? item.Note : "";
                item.Remarks += "|";
                item.Remarks += item.Remark ? item.Remark : "";
                //bij nic plus moet NICAuditRoomCategories leeg zijn
                if (item.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) 
                {
                    item.NICAuditRoomCategories = [];
                }

                //om te voorkomen dat loggen op server gelockt wordt 
                setTimeout(function () {
                    self.sentAuditByAjax(item, readyFunction);
                }, 2000);
                
            });
        });
    }

    this.sentAuditByAjax = function (audit, readyFunction) {
        var json = JSON.stringify(audit);
        $.ajax({
            url: saveNicAuditUrl, type: "POST", data: { id: audit.Id,  json: json },
            success: function (result) {
            	if (result.Success) {
            		var text = "Synchroniseren geslaagd. Meting verstuurd (" + audit.Object.Name + ")<br/>";
            		text += "Voor testdoeleinden worden metingen voorlopig niet automatisch verwijderd na synchroniseren. Verwijder de metingen na controle van de rapportages door op de knop verwijderen te klikken.<br/><br/>  "
            		$("#syncLog").append(text);

            		//delete uit local db
            		//self.deleteAudit(item);

            		//voor testen status op verzonden zetten en opslaan
            		audit.AuditStateId = NicModel.DatabaseIDs.Status.Sent;
            		self.saveAudit(toJSON(audit));

            		//opnieuw button text zetten:
            		nicApp.pages["SyncPage"].render();
            		if (readyFunction) readyFunction();
            	} else {
            		switch (result.ErrorCode) {
            			case 1: // Not logged on
            				window.location.href = result.LoginUrl;
            				break;
            			default:
            				var text = "<span class='validationMsg'>Synchroniseren niet geslaagd. Er zijn fouten opgetreden bij het verzenden van de afgeronde meting '" + result.Message + "</span><br/> ";
            				$("#syncLog").append(text);
            				break;
            		}
            		$.mobile.loading("hide");
            		$("#SyncFinishedAuditsButton").removeAttr("disabled");
				}
            },
            error: function (xhr, ajaxOptions, thrownError) {
                var errMsg = xhr.responseText.match("<title>(.*?)</title>")[1];
                var text = "<span class='validationMsg'>Synchroniseren niet geslaagd. Er zijn fouten opgetreden bij het verzenden van de afgeronde meting '" + thrownError + ": " + errMsg + ((item.Object) ? "' Meting:  " + item.Object.Name : "" ) + "</span><br/> ";
                $("#syncLog").append(text);
                $.mobile.loading("hide");
                $("#SyncFinishedAuditsButton").removeAttr("disabled");
            }
        });
    }

    this.syncAll = function (readyFunction) {
        $("#message").text("");
        var self = this;
        self.initialSync(function () {
            self.fillAudits(NicApp.loginId, function () {
                self.sendFinishedAudits(function () {
                    if (readyFunction) readyFunction();
                });
            });
        });
    }

    this.deleteSentAudits = function (readyFunction) {
        $("#message").text("");
        var self = this;
        this.db.values("NIC.Audit").done(function (result) {
            if (Enumerable.From(result).Where("$.AuditStateId==99").Count() == 0) {
                if (readyFunction) readyFunction();
            }
            Enumerable.From(result).Where("$.AuditStateId==99").ForEach(function (item, index) {
                //delete uit local db
                self.deleteAudit(item);
            });
            var text = "Metingen zijn verwijderd.<br/>";
            $("#syncLog").append(text);
            //opnieuw button text zetten:
            nicApp.pages["SyncPage"].render();
        });
    }
    

    this.fillDebugAudit = function (readyFunction) {
        $("#message").text("");
        var self = this;
        $.ajax({
            url: getDebugAuditUrl, type: "POST", dataFilter: nicApp.dateReviver
                , success: function (data) {
                    self.db.put('NIC.Audit', data).fail(function (err) {
                        throw err;
                    }).done(function (items) {
                        var text = "Synchroniseren geslaagd. Er is 1 nieuwe debug meting opgehaald.<br/>";
                        $("#syncLog").append(text);
                        if (readyFunction) readyFunction();
                    });
                },
            error: function (xhr, ajaxOptions, thrownError) {

                var text = "<span class='validationMsg'>Synchroniseren niet geslaagd. Er zijn fouten opgetreden bij het ophalen van nieuwe metingen '" + thrownError + "'</span><br/> ";
                $("#syncLog").append(text);
                $.mobile.loading("hide");
            }
        });
    }


    /////////////////////
    ///DATABASE ACTIES LOKALE DB
    /////////////////////
    this.getAudits = function () {
        var query = self.db.values('NIC.Audit');

        return query;
    }

    this.getAudit = function (id) {
        var query = self.db.get('NIC.Audit', id);

        return query;
    }

    this.saveAudit = function (audit, successCallback) {
        var query = self.db.put({ name: 'NIC.Audit', keyPath: 'Id' }, audit);

        query.done(function (key) {
            //nog niet gebruikt
            if (successCallback) successCallback;
        });
        query.fail(function (err) {
            throw err;
        });

        return query;
    }


    this.deleteAudit = function (audit, successCallback) {
        var query = self.db.remove('NIC.Audit', audit.Id);

        query.done(function (key) {
            //nog niet gebruikt
            if (successCallback) successCallback;
        });
        query.fail(function (err) {
            throw err;
        });

        return query;
    }



    this.loadStaticData = function (doneCallback) {
        $.mobile.loading({ text: "Laden statische gegevens..." });

        this.StaticData.loadedCallback = doneCallback;
        var countDone = 0;
        for (var i in this.staticDataTableMappings) {
            var mapping = this.staticDataTableMappings[i];
            var request = this.db.values(mapping.TableName, null, 1048576); // Avoid the default 100 records limit.
            mapping.isLoaded = false;
            request.done(this.callBackOnStaticDataLoaded(i));
            request.fail(function (err) {
                alert(err);
            });
            
        }
    }

    this.callBackOnStaticDataLoaded = function (i) {
        var self = this;

        return function (items) {
            var mapping = self.staticDataTableMappings[i];
            NicModel.StaticData[mapping.ObjectName] = items;
            mapping.isLoaded = true;
            if (self.StaticData.loadedCallback && Enumerable.From(self.staticDataTableMappings).All("$.isLoaded")) {
                self.StaticData.loadedCallback();
                self.StaticData.loadedCallback = null;
            }
        }
    }



    var self = this;
    //laden statische data: zie index.aspx

    return self;
}


