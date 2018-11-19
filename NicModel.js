//namespace;
var NicModel = {};

NicModel.Audit = function () {
    this.IndOnvoldoendeM2 = 0;
    //VAR voor rapport
    this.finalResults = {};
    this.NICAuditRooms = [];
    this.AllRooms = [];

    this.getRooms = function () {
        //alle ruimtes in gebouw
        //todo: eventueel oplossen met jsLinq met join
        if (!this.AllRooms) return [];
        if (this.AllRooms.length > 0) return this.AllRooms;
        var allRooms = [];
        for (var i in this.Buildings) {
            var building = this.Buildings[i];

            var floors = building.Floors;
            for (var j in floors) {
                var floor = floors[j];

                for (var k in floor.Rooms) {
                    var room = floor.Rooms[k];
                    room.BuildingId = building.Id;
                    room.FloorId = floor.Id;
                    room.BuildingName = building.Name;
                    room.FloorName = floor.Name;
                    room.BuildingSortOrder = building.SortOrder;
                    room.FloorSortOrder = floor.SortOrder;

                    allRooms.push(room);
                }
            }
        }
        this.AllRooms = allRooms;
        return allRooms;
    }

    this.getRoomById = function (id) {
        var queryResult = Enumerable.From(this.getRooms())
            .Where("$.Id == " + id);

        var auditRoom = queryResult.SingleOrDefault();
        return auditRoom ? auditRoom : new Object();
    }

    this.getAuditRoomById = function (id) {
        var queryResult = Enumerable.From(this.NICAuditRooms)
            .Where("$.RoomId == " + id);

        var auditRoom = queryResult.SingleOrDefault();
        return auditRoom;
    }

    this.removeAuditRoomById = function (id) {
        this.NICAuditRooms = removeFromArray(this.NICAuditRooms, "RoomId", id);
    }

    this.createSampleOfRoomsDummyTest = function () {
        //sample maken met 2 ruimtes ter test
        var auditRoomsInSample = [];
        var rooms = this.getRooms();
        for (var i = 0; i < 2; i++) {
            var room = rooms[i];
            var auditRoom = new NicModel.AuditRoom();
            auditRoom = auditRoom.createFromRoom(room, this);
            if (i == 0) {
                auditRoom.Area = 9;
                auditRoom.RoomDescription = "Toilet";
                auditRoom.NICRoomCategoryId = 3;
                auditRoom.NICRoomCategory = NicModel.StaticData.GetById("RoomCategories", 3);
                auditRoom.RoomIndication = "sanitair";
                auditRoom.BE = Math.ceil(auditRoom.Area / auditRoom.NICRoomCategory.M2BE);
            }
            else if (i == 1) {
                auditRoom.Area = 30;
                auditRoom.RoomDescription = "Lesruimte";
                auditRoom.NICRoomCategoryId = 4;
                auditRoom.NICRoomCategory = NicModel.StaticData.GetById("RoomCategories", 4);
                auditRoom.RoomIndication = "wvv";
                auditRoom.BE = Math.ceil(auditRoom.Area / auditRoom.NICRoomCategory.M2BE);
            }

            auditRoom.Ind_Steekproef = 1;
            //auditRoom = $.extend(auditRoom, new NicModel.AuditRoom())
            auditRoomsInSample.push(auditRoom);

        }
        this.NICAuditRooms = auditRoomsInSample;

        this.AuditStateId = NicModel.DatabaseIDs.Status.SampleTest;

        //opslaan in lokale db
        nicApp.db.saveAudit(toJSON(this));

    }

    this.createSampleOfRooms = function () {

        //this.createSampleOfRoomsDummyTest();
        //return;
        //0.
        //initialiseren vars:
        var auditRoomsInSample = [];
        var rooms = this.getRooms();

        var nicAuditRoomCategories = [];
        for (var i in NicModel.StaticData.RoomCategories) {
            var roomcategory = NicModel.StaticData.RoomCategories[i];
            //van algemene ruimte category (static data) een AuditRoomCategory maken
            var nicAuditRoomCategory = new NicModel.AuditRoomCategory(this.Id, roomcategory);
            nicAuditRoomCategories.push(nicAuditRoomCategory);
        }
        //1.
        //totalen in gebouw berekenen
        for (var i in rooms) {
            var room = rooms[i];

            var nicAuditRoomCategory2 = findInArray(nicAuditRoomCategories, "NICRoomCategoryId", room.NICRoomCategoryId);
            nicAuditRoomCategory2.TotalM2InBuilding += room.Area ? parseInt(room.Area) : 0;
        }

        //2.
        //per ruimtecategorie de grootte van steekproef bepalen aan de hand totalen in gebouw
        //dit gaat met steekproeftabel: NICAuditSampleSizes
        for (var i in nicAuditRoomCategories) {
            var nicAuditRoomCategory = nicAuditRoomCategories[i];
            if (!nicAuditRoomCategory) continue;

            var where = "$.NICRoomCategoryId == " + nicAuditRoomCategory.NICRoomCategoryId;
            where += " && $.M2_From <= " + nicAuditRoomCategory.TotalM2InBuilding + " && $.M2_Until > " + nicAuditRoomCategory.TotalM2InBuilding;
            var auditSampleSize = NicModel.StaticData.GetFirstValue("NICAuditSampleSizes", where);

            nicAuditRoomCategory.TotalM2NeededInSample = auditSampleSize ? auditSampleSize.M2_ToMeasure : 0;

        }


        //3.
        //Het systeem trekt nu een steekproef per ruimtecategorie, op basis van dezelfde methode als bij NICExtra. 
        //Dus m2 ruimtecategorie in steekproeftabel, geeft m2 te meten. Stoppen zodra of er geen
        //ruimten meer zijn of tot het benodigde aantal m2 verkregen is.
        //todo kan met jsLinq
        rooms = shuffle(rooms);

        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];

            //bugfix: als ruimte 0m2 is wordt die meegenomen in steekproef, geeft fouten bij ruimtecategorie
            if (room.Area == 0) continue;
            var nicAuditRoomCategory = findInArray(nicAuditRoomCategories, "NICRoomCategoryId", room.NICRoomCategoryId);

            if (nicAuditRoomCategory.TotalM2InSample <= nicAuditRoomCategory.TotalM2NeededInSample) {
                auditRoomsInSample.push(room);
                nicAuditRoomCategory.TotalM2InSample += room.Area;
            }
        }

        this.NICAuditRoomCategories = [];
        //alleen die in gebouw voorkomen toevoegen
        for (var i in nicAuditRoomCategories) {
            var nicAuditRoomCategory = nicAuditRoomCategories[i];
            if (nicAuditRoomCategory.TotalM2InBuilding > 0) {
                this.NICAuditRoomCategories.push(nicAuditRoomCategory);
            }
        }

        this.saveSampleOfRooms(auditRoomsInSample);

    }

    this.saveSampleOfRooms = function (roomsInSample) {

        var auditRooms = []; //de ruimtes in de steekproef
        //opnieuw init var TotalM2InSample, want wordt hierna opnieuw bepaald
        for (var i in this.NICAuditRoomCategories) {
            var nicAuditRoomCategory = this.NICAuditRoomCategories[i];

            nicAuditRoomCategory.TotalM2InSample = 0;
        }

        //ruimtes die gemarkeert zijn als bezet, zitten toch in steekproef, maar worden niet meegeteld met totalen
        for (var i in this.NICAuditRooms) {
            var room = this.NICAuditRooms[i];
            if (room.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied) {
                auditRooms.push(room);
            }
        }
        //ruimtes uit lijst toevoegen
        for (var i = 0; i < roomsInSample.length; i++) {
            var room = roomsInSample[i];
            var nicAuditRoomCategory = findInArray(this.NICAuditRoomCategories, "NICRoomCategoryId", room.NICRoomCategoryId);

            nicAuditRoomCategory.TotalM2InSample += room.Area;
            var auditRoom = this.getAuditRoomById(room.Id);
            if (!auditRoom) {
                //nieuwe aanmaken
                var auditRoom = new NicModel.AuditRoom();
                auditRoom = auditRoom.createFromRoom(room, this);
            }
            auditRooms.push(auditRoom);
        }

        this.NICAuditRooms = auditRooms;
        this.AuditStateId = NicModel.DatabaseIDs.Status.SampleTest;

        //opslaan in lokale db
        nicApp.db.saveAudit(toJSON(this));
    }

    this.removeRoomFromSample = function (occupiedAuditRoom) {
        occupiedAuditRoom.Ind_Gemeten = NicModel.DatabaseIDs.AuditRoomStatus.Occupied;


        var nicAuditRoomCategory = findInArray(this.NICAuditRoomCategories, "NICRoomCategoryId", occupiedAuditRoom.NICRoomCategoryId);
        nicAuditRoomCategory.TotalM2InSample -= occupiedAuditRoom.Area;

        this.findBackupRoomsForSample(nicAuditRoomCategory, occupiedAuditRoom);
    }

    //na klik op checkbox om een bezette ruimte toch weer te integreren in steekproef
    this.appendRoomToSample = function (backupAuditRoom) {
        backupAuditRoom.Ind_Gemeten = NicModel.DatabaseIDs.AuditRoomStatus.UnFinished;


        var nicAuditRoomCategory = findInArray(this.NICAuditRoomCategories, "NICRoomCategoryId", backupAuditRoom.NICRoomCategoryId);
        nicAuditRoomCategory.TotalM2InSample += backupAuditRoom.Area;
        //opslaan in lokale db
        nicApp.db.saveAudit(toJSON(this));
        return backupAuditRoom;
    }

    //na klik op 'ruimte = bezet' moet er een reserve ruimte worden gezocht.
    this.findBackupRoomsForSample = function (nicAuditRoomCategory, occupiedAuditRoom) {
        var self = this;
        var allRooms = this.getRooms();

        var neededInSample = nicAuditRoomCategory.TotalM2NeededInSample;
        if (nicAuditRoomCategory.TotalM2InSample >= nicAuditRoomCategory.TotalM2NeededInSample ||
            nicAuditRoomCategory.TotalM2InSample >= nicAuditRoomCategory.TotalM2InBuilding) {
            //zoeken van reserveruimte is niet nodig, want er zit genoeg in steekproef
            //(kan het geval zijn indien laatst toegeveogde ruimte in steekproef heel groot is en je een kleine ruimte als bezet markeert
            //opslaan in lokale db
            nicApp.db.saveAudit(toJSON(this));
            return;
        }

        //sorteren op loopvolgorde
        var allRoomsInCategory = Enumerable.From(allRooms).Where("$.NICRoomCategoryId == " + occupiedAuditRoom.NICRoomCategoryId).OrderBy("$.BuildingSortOrder")
            .ThenBy("$.FloorSortOrder").ThenBy("$.RoomNumber").ToArray();
        //eerst volgende ruimte nemen in loopvolgorde
        var itemFoundAtIndex = -1;
        for (var index in allRoomsInCategory) {
            var item = allRoomsInCategory[index];
            //bepalen van plek van ruimte die bezet is
            if (item.Id == occupiedAuditRoom.RoomId) {
                itemFoundAtIndex = index;
            }
            //als de plek is gevonden, volgende ruimte zoeken
            if (itemFoundAtIndex >= 0) {
                //kijken of die niet al in de steekproef zit
                if (self.getAuditRoomById(item.Id)) continue;
                //anders kijken of er ruimtes bijmoeten in steekproef
                if (nicAuditRoomCategory.TotalM2InSample < nicAuditRoomCategory.TotalM2NeededInSample) {
                    var auditRoom = new NicModel.AuditRoom().createFromRoom(item, self);
                    auditRoom.Ind_Gemeten = NicModel.DatabaseIDs.AuditRoomStatus.Backup; //reserve
                    self.NICAuditRooms.push(auditRoom);
                    nicAuditRoomCategory.TotalM2InSample += auditRoom.Area;
                }
                else {
                    break;
                }

            }
        };

        //kijken of er voldoende ruimtes zijn gevonden tussen de ruimtes verderop in de loopvolgorde
        //zo nee, verder zoeken in ruimtes eerder in de loopvolgorde
        if (nicAuditRoomCategory.TotalM2InSample <= nicAuditRoomCategory.TotalM2NeededInSample &&
            nicAuditRoomCategory.TotalM2InSample < nicAuditRoomCategory.TotalM2InBuilding) {
            for (var index in allRoomsInCategory) {
                var item = allRoomsInCategory[index];
                //kijken of die niet al in de steekproef zit
                if (self.getAuditRoomById(item.Id)) continue;
                if (nicAuditRoomCategory.TotalM2InSample < nicAuditRoomCategory.TotalM2NeededInSample) {
                    var auditRoom = new NicModel.AuditRoom().createFromRoom(item, self);
                    auditRoom.Ind_Gemeten = NicModel.DatabaseIDs.AuditRoomStatus.Backup; //reserve
                    self.NICAuditRooms.push(auditRoom);
                    nicAuditRoomCategory.TotalM2InSample += auditRoom.Area;
                }
                else {
                    break;
                }
            };
        }

        //als er nog steeds tekort is Ind_Onvoldoende steekproef zetten
        if (nicAuditRoomCategory.TotalM2InSample <= nicAuditRoomCategory.TotalM2NeededInSample &&
            nicAuditRoomCategory.TotalM2InSample < nicAuditRoomCategory.TotalM2InBuilding) {
            self.IndOnvoldoendeM2 = 1;
        }

        //opslaan in lokale db
        nicApp.db.saveAudit(toJSON(this));
    }

    this.sampleIsValid = function () {
        var isValid = true;
        var totalSquareMetersNeededInSample = 0, totalSquareMetersInBuilding = 0, totalSquareMetersInSample = 0;
        for (var i in this.NICAuditRoomCategories) {
            var nicAuditRoomCategory = this.NICAuditRoomCategories[i];
            if (!nicAuditRoomCategory) continue;
            if (nicAuditRoomCategory.TotalM2InBuilding == 0) continue;

            if (nicAuditRoomCategory.TotalM2InSample < nicAuditRoomCategory.TotalM2NeededInSample &&
                nicAuditRoomCategory.TotalM2InSample < nicAuditRoomCategory.TotalM2InBuilding) {
                isValid = false;
                break;
            }

        }
        this.IndOnvoldoendeM2 = isValid ? 0 : 1;
        return isValid;
    }

    this.countUnfinishedRoomsInSample = function () {
        //0 = niet gemeten
        //4 = reserve niet gemeten
        var queryResult = Enumerable.From(this.NICAuditRooms)
            .Where("$.Ind_Gemeten==0 || $.Ind_Gemeten==4");

        return queryResult.Count();
    }

    this.getAreaOfFinishedRooms = function (roomCategoryId) {
        var queryResult = Enumerable.From(this.NICAuditRooms)
            .Where("($.Ind_Gemeten==1 || $.Ind_Gemeten==4) && $.NICRoomCategoryId==" + roomCategoryId)
            .Select("parseInt($.Area)");

        return queryResult.Sum();
    }

    this.makeFinalCalculations = function () {
        if (this.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
            this.makeFinalCalculations_NicExtra();
        }
        else if (this.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {
            this.makeFinalCalculations_NicPlus();
        }
        nicApp.db.saveAudit(toJSON(this));
    }

    this.makeFinalCalculations_NicPlus = function () {
        var self = this;
        var rooms = self.NICAuditRooms;

        var results = {
            //wvv = werk/verblijf/verkeer
            wvv: {
                floors: {
                    G: 0, O: 0, A: 0, percO: 0, percA: 0, minusO: 0, minusA: 0, grade: 0, score: 0, factor: 2, totalBE: 0, totalM2: 0
                },
                interior: {
                    G: 0, O: 0, A: 0, percO: 0, percA: 0, minusO: 0, minusA: 0, grade: 0, score: 0, factor: 1
                },
                inventory: {
                    G: 0, O: 0, A: 0, percO: 0, percA: 0, minusO: 0, minusA: 0, grade: 0, score: 0, factor: 3
                }
            }, sanitair: {
                floors: {
                    G: 0, O: 0, A: 0, percO: 0, percA: 0, minusO: 0, minusA: 0, grade: 0, score: 0, factor: 4, totalBE: 0, totalM2: 0
                },
                interior: {
                    G: 0, O: 0, A: 0, percO: 0, percA: 0, minusO: 0, minusA: 0, grade: 0, score: 0, factor: 4
                },
                inventory: {
                    G: 0, O: 0, A: 0, percO: 0, percA: 0, minusO: 0, minusA: 0, grade: 0, score: 0, factor: 4
                }
            }
        };

        var totalBE = 0, totalM2 = 0;
        for (var i in rooms) {
            var auditRoom = rooms[i];
            if (!(auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished || auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished)) continue;
            for (var i in auditRoom.NICAuditRoomInventories) {
                var roomResult = auditRoom.NICAuditRoomInventories[i];
                results[roomResult.RoomIndication][roomResult.AreaOfAttentionName][roomResult.Result] += parseInt(auditRoom.BE);
                if (roomResult.AreaOfAttentionName == "floors") {
                    results[roomResult.RoomIndication][roomResult.AreaOfAttentionName].totalBE += parseInt(auditRoom.BE);
                    results[roomResult.RoomIndication][roomResult.AreaOfAttentionName].totalM2 += parseInt(auditRoom.Area);
                }
            }

            totalBE += parseInt(auditRoom.BE);
            totalM2 += parseInt(auditRoom.Area);
        }

        //3.percentages
        for (var indication in results) {
            for (var areaOfAttentionName in results[indication]) {
                if (results[indication]["floors"].totalBE > 0) {
                    results[indication][areaOfAttentionName].percO = results[indication][areaOfAttentionName].O / results[indication]["floors"].totalBE * 100;
                    results[indication][areaOfAttentionName].percA = results[indication][areaOfAttentionName].A / results[indication]["floors"].totalBE * 100;
                }
            }
        }

        //4. minpunten
        for (var indication in results) {
            for (var areaOfAttentionName in results[indication]) {
                var ratingId = 2;
                var where = "$.NICBuildingCategoryId == " + self.BuildingCategoryId;
                where += " && $.Within4Hours == ";
                where += (self.IndBinnen4Uur) ? "1" : "0";
                where += " && $.ResultId == " + ratingId;
                where += " && $.PercentageFrom <= " + results[indication][areaOfAttentionName].percO + " && $.PercentageUntil >= " + results[indication][areaOfAttentionName].percO;
                var minusPointO = NicModel.StaticData.GetFirstValue("MinusPoints", where);
                results[indication][areaOfAttentionName].minusO = (minusPointO) ? minusPointO.Value : 0;

                var ratingId = 3;
                var where = "$.NICBuildingCategoryId == " + self.BuildingCategoryId;
                where += " && $.Within4Hours == ";
                where += (self.IndBinnen4Uur) ? "1" : "0";
                where += " && $.ResultId == " + ratingId;
                where += " && $.PercentageFrom <= " + results[indication][areaOfAttentionName].percA + " && $.PercentageUntil >= " + results[indication][areaOfAttentionName].percA;
                var minusPointA = NicModel.StaticData.GetFirstValue("MinusPoints", where);
                results[indication][areaOfAttentionName].minusA = (minusPointA) ? minusPointA.Value : 0;
            }
        }

        //van sanitair aandachtsgebieden optellen
        results.sanitair.minusO = results.sanitair.floors.minusO + results.sanitair.interior.minusO + results.sanitair.inventory.minusO;
        results.sanitair.minusA = results.sanitair.floors.minusA + results.sanitair.interior.minusA + results.sanitair.inventory.minusA;

        //cijfer & score bepalen
        //cijfer van wvv bepalen
        var sumOfGrades = 0, sumOfScores = 0;
        var numberOfParts = 0;
        for (var indication in results) {
            for (var areaOfAttentionName in results[indication]) {
                results[indication][areaOfAttentionName].grade = 8 - results[indication][areaOfAttentionName].minusO - results[indication][areaOfAttentionName].minusA;
                if (results[indication][areaOfAttentionName].grade < 3) results[indication][areaOfAttentionName].grade = 3;

                //afronden 1 decimaal
                //results[indication][areaOfAttentionName].grade = results[indication][areaOfAttentionName].grade % 1 ? results[indication][areaOfAttentionName].grade.toFixed(1) : results[indication][areaOfAttentionName].grade;

                results[indication][areaOfAttentionName].score = results[indication][areaOfAttentionName].grade * results[indication][areaOfAttentionName].factor;


                if (indication == "wvv" && results[indication][areaOfAttentionName].grade > 0) {
                    //sanitair wordt verderop gemiddelde van berekend
                    numberOfParts++;
                    sumOfGrades += results[indication][areaOfAttentionName].grade;
                    sumOfScores += results[indication][areaOfAttentionName].score;

                }
            }
        }

        //cijfer van sanitair bepalen
        ////cijfer is 8 - gem(som(minpunten))
        //var numberOfPartsWithMinusPoints = 0;
        //for (var areaOfAttentionName in results.sanitair) {
        //    if ((results.sanitair[areaOfAttentionName].minusO + results.sanitair[areaOfAttentionName].minusA) > 0) {
        //        numberOfPartsWithMinusPoints++;
        //    }
        //}
        //results.sanitair.meanMinusPoints = 0;
        //if (numberOfPartsWithMinusPoints > 0) {
        //    results.sanitair.meanMinusPoints = (results.sanitair.minusO + results.sanitair.minusA) / numberOfPartsWithMinusPoints;
        //}
        results.sanitair.grade = 0;
        results.sanitair.score = 0;
        results.sanitair.factor = 4;
        if (results.sanitair.floors.totalM2 > 0) {
            results.sanitair.meanMinusPoints = (results.sanitair.minusO + results.sanitair.minusA) / 3;

            results.sanitair.grade = (results.sanitair.floors.grade + results.sanitair.inventory.grade + results.sanitair.interior.grade) / 3;
            //afronden 1 decimaal
            //results.sanitair.grade = results.sanitair.grade % 1 ? results.sanitair.grade.toFixed(1) : results.sanitair.grade;

            results.sanitair.score = results.sanitair.grade * results.sanitair.factor;
            sumOfGrades += results.sanitair.grade;
            sumOfScores += results.sanitair.score;
            numberOfParts++;
        }
        //eind cijfers
        results.totalM2 = totalBE;
        results.totalBE = totalBE;
        results.mean = sumOfScores / numberOfParts;
        results.finalScore = sumOfScores;
        if (results.sanitair.score == 0) {
            results.finalScore *= (10 / 6); 
        }
        this.finalResults = results;
        this.translateFinalResultToDBTable_NicPlus(results);
        return results;
    }

    this.makeFinalCalculations_NicExtra = function () {
        var self = this;
        var rooms = self.NICAuditRooms;

        //0. eerst alle tellingen per ruimte cat leeg maken
        for (var i in self.NICAuditRoomCategories) {
            var nicAuditRoomCategory = self.NICAuditRoomCategories[i];

            nicAuditRoomCategory.NumberOf3 = 0;
            nicAuditRoomCategory.NumberOf6 = 0;
            nicAuditRoomCategory.NumberOf8 = 0;
            nicAuditRoomCategory.NumberTotal = 0;
            nicAuditRoomCategory.NumberOfFaultsPO = 0;
            nicAuditRoomCategory.NumberOfFaultsDO = 0;
            nicAuditRoomCategory.Score = 0;
        }

        //1. tellen resultaten per ruimtecategorie
        for (var i in rooms) {
            var room = rooms[i];
            var auditRoom = $.extend(room, new NicModel.AuditRoom());
            if (!(auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished || auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished)) continue;


            var roomResult = auditRoom.getNicExtraResultsTotals();
            var nicAuditRoomCategory = findInArray(self.NICAuditRoomCategories, "NICRoomCategoryId", room.NICRoomCategoryId);

            nicAuditRoomCategory.NumberOf3 += roomResult.Number3;
            nicAuditRoomCategory.NumberOf6 += roomResult.Number6;
            nicAuditRoomCategory.NumberOf8 += roomResult.Number8;
            nicAuditRoomCategory.NumberTotal += roomResult.NumberTotal;
            nicAuditRoomCategory.NumberOfFaultsPO += roomResult.NumberFaultsPO;
            nicAuditRoomCategory.NumberOfFaultsDO += roomResult.NumberFaultsDO;
        }
        //2. score berekenen
        for (var i in self.NICAuditRoomCategories) {
            var categoryResult = self.NICAuditRoomCategories[i];
            var acceptanceBoundary = findInArray(this.AcceptanceBoundaries, "NICRoomCategoryId", categoryResult.NICRoomCategoryId);
            var GKP = acceptanceBoundary ? acceptanceBoundary.GKP : 10;
            var GKG = Math.round(categoryResult.NumberTotal * GKP / 100); //todo uitzoeken hoe je aan GKG komt
            
            var score = 0;
            if (categoryResult.NumberOf3 > GKG) {
                //fout formule
                score = 6 - (((categoryResult.NumberOf3 - GKG) / (categoryResult.NumberTotal - GKG)) * 3);
            }
            else {
                //goedformule
                if (categoryResult.NumberOf6 + categoryResult.NumberOf8 == 0) {
                    //voorkom delen door 0, zie FO
                    if (GKG == 0) {
                        score = 0;
                    }
                    else {
                        score = (categoryResult.NumberOf3 / GKG * 6);
                    }
                }
                else {
                    score = (categoryResult.NumberOf3 / GKG * 6) + (1 - (categoryResult.NumberOf3 / GKG)) * (((categoryResult.NumberOf6 * 6) + (categoryResult.NumberOf8 * 8)) / (categoryResult.NumberOf6 + categoryResult.NumberOf8));
                }
            }
            categoryResult.Perc3 = (categoryResult.NumberOf3 / categoryResult.NumberTotal) * 100;
            categoryResult.GKP = GKP;
            categoryResult.GKG = GKG;
            categoryResult.Score = score;
        }


        this.translateFinalResultToDBTables_NicExtra();
    }

    this.translateFinalResultToDBTable_NicPlus = function (result) {
        this.NICAuditRoomCategoryInventories = [];
        for (var indication in NicModel.DatabaseIDs.AreasOfAttention) {
            for (var areaOfAttentionName in NicModel.DatabaseIDs.AreasOfAttention[indication]) {
                //komt soms voor dat er geen sanitair is, dan score 0 ipv 8
                if (result[indication]["floors"].totalM2 > 0) {
                    var areaOfAttentionId = NicModel.DatabaseIDs.AreasOfAttention[indication][areaOfAttentionName];
                    auditResult = new NicModel.AuditResult();
                    auditResult.Id = generateUUID();
                    auditResult.NICAuditId = this.Id;
                    auditResult.NICRoomCategoryId = this.NICRoomCategoryId;
                    auditResult.InventoryTypeId = areaOfAttentionId;
                    auditResult.M2InAudit = result[indication]["floors"].totalM2;
                    auditResult.AuInAudit = result[indication]["floors"].totalBE;
                    auditResult.CountO = result[indication][areaOfAttentionName].O;
                    auditResult.CountA = result[indication][areaOfAttentionName].A;
                    auditResult.FaultPercentageO = parseInt(result[indication][areaOfAttentionName].percO.toFixed(0));
                    auditResult.FaultPercentageA = parseInt(result[indication][areaOfAttentionName].percA.toFixed(0));
                    auditResult.MinusPointsO = result[indication][areaOfAttentionName].minusO;
                    auditResult.MinusPointsA = result[indication][areaOfAttentionName].minusA;
                    auditResult.ReportMark = parseFloat(result[indication][areaOfAttentionName].grade.toFixed(1));

                    auditResult.Weight = result[indication][areaOfAttentionName].factor;
                    if (indication == "sanitair") {
                        auditResult.Weight /= 3;
                    }
                    this.NICAuditRoomCategoryInventories.push(auditResult);
                }
            }
        }

        //bezette ruimtes mogen geen resulaten bevatten. Deze eruit halen
        for (var i in this.NICAuditRooms) {
            var auditRoom = this.NICAuditRooms[i];
            if (auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Occupied) {
                auditRoom.NICAuditRoomInventories = [];
            }
        }

        //score zetten
        this.Score = result.finalScore;

        //opslaan
        nicApp.currentAudit.AuditStateId = NicModel.DatabaseIDs.Status.Calculated;
        var query = nicApp.db.saveAudit(toJSON(this));
    }

    this.translateFinalResultToDBTables_NicExtra = function (results) {
        //this.NICAuditRoomCategories = [];
        for (var i in this.NICAuditRoomCategories) {
            var category = this.NICAuditRoomCategories[i];

            //todo eventueel: TotalM2InSample in js aanpassen naar M2_sample
            category.M2_Sample = category.TotalM2InSample;
            category.M2_InAudit = category.TotalM2Finished;
            category.ApprovalLimit = category.GKG;
            category.GKP = category.GKP;
            category.NumberOf_DOPO = category.NumberTotal;// category.NumberOfFaults_DO + category.NumberOfFaults_PO;
            category.Mean = null;
            category.AQL = category.GKP;
            category.Score = parseFloat(category.Score.toFixed(1));
        }

        //aanmaken tabel voor tellingen per ruimte 2keer
        var rooms = this.NICAuditRooms;
        var categoryResults = [];
        this.NICInventories = [];
        this.NICRoomInventories = [];
        for (var i in this.NICAuditRooms) {
            var auditRoom = this.NICAuditRooms[i];

            if (!(auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished || auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished)) continue;
            var room = this.getRoomById(auditRoom.RoomId);
            room.NICRoomInventories = [];
            for (var j in auditRoom.AuditElements) {
                var result = auditRoom.AuditElements[j];
                var nicRoomInventory = {
                    //Id: generateUUID(),
                    NicAuditId: this.Id,
                    AuditDateTime: this.TimeStart,
                    RoomId: auditRoom.RoomId,
                    ElementId: result.ElementId,
                    Number: result.NumberTotal
                }
                //room.NICRoomInventories.push(nicRoomInventory);
                this.NICRoomInventories.push(nicRoomInventory);

                var nicInventory = {
                    Id: generateUUID(),
                    NICAuditId: this.Id,
                    AuditDateTime: this.TimeStart,
                    RoomId: auditRoom.RoomId,
                    NICElementId: result.ElementId,
                    Number3: result.Number3,
                    Number6: result.Number6,
                    Number8: result.Number8,
                    NumberTotal: 0, //wordt niet gebruikt op MIS rapport
                    Ind_DOPO: 0 //wordt niet gebruikt  op MIS rapport
                }
                this.NICInventories.push(nicInventory);
            }
        }

        //aanmaken tabel met fouten
        this.NICAuditInventories = [];
        for (var i in this.NICAuditRooms) {
            var auditRoom = this.NICAuditRooms[i];
            if (!(auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished || auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished)) continue;

            for (var j in auditRoom.AuditElements) {
                var result = auditRoom.AuditElements[j];
                for (var k in result.FaultTypes) {
                    var faultType = result.FaultTypes[k];
                    var nicAuditInventory = {
                        Id: generateUUID(),
                        NICAuditId: this.Id,
                        RoomId: auditRoom.RoomId,
                        NICElementId: faultType.ElementId,
                        NICFaultTypeId: faultType.FaultTypeId,
                        Score: 3,
                        Ind_DOPO: (faultType.Ind_DOPO == "DO") ? 0 : 2,
                        Count: faultType.NumberOfFaults
                    }
                    this.NICAuditInventories.push(nicAuditInventory);
                }
            }
        }

        //leegmaken  NICAuditRoomInventories, want wordt alleen gebruikt bij nicplus

        for (var i in this.NICAuditRooms) {
            var auditRoom = this.NICAuditRooms[i];
            auditRoom.NICAuditRoomInventories = [];
        }



        nicApp.currentAudit.AuditStateId = NicModel.DatabaseIDs.Status.Calculated;
        var query = nicApp.db.saveAudit(toJSON(nicApp.currentAudit));
    }

    this.getTotalBEInBuilding = function (filter) {
        var totalBE = 0;
        var rooms = this.getRooms();
        for (var i in rooms) {
            var room = rooms[i];
            var roomcategory = NicModel.StaticData.GetById("RoomCategories", room.NICRoomCategoryId);
            if (filter && filter == "sanitair") {
                if (roomcategory.IndWerkVerblijfVerkeer != 2) continue;
            }
            else if (filter && filter == "wvv") {
                if (roomcategory.IndWerkVerblijfVerkeer == 2) continue;
            }
            var m2 = parseInt(room.Area);
            var factor = roomcategory.M2BE;
            totalBE += Math.ceil(m2 / factor);
        }
        return totalBE;
    }

    //maak array met tellingen van alle fouten
    this.getAllFailures_NicPlus = function () {
        var faults = [];
        for (var i in this.NICAuditRooms) {
            var auditRoom = this.NICAuditRooms[i];
            if (!(auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished || auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished)) continue;
            for (var j in auditRoom.NICAuditRoomInventories) {
                var result = auditRoom.NICAuditRoomInventories[j];
                if (result.Result != 'G') {
                    var faultDescription = result.Remark;
                    if (result.RoomResultDescriptionId > 0) {
                        //var faultType = NicModel.StaticData.FaultTypes.GetById(result.RoomResultDescriptionId);
                        //faultDescription = faultType.Name;
                        faultDescription = result.RoomResultDescription
                    }
                    var itemFoundInArray = findInArray(faults, "RoomResultDescription", result.RoomResultDescription);
                    if (!itemFoundInArray) {
                        //var newFault = { RoomResultDescriptionId: result.RoomResultDescriptionId, Name: result.RoomResultDescription, Total: 1 };
                        var newFault = { Name: faultDescription, Total: 1 };

                        faults.push(newFault);
                    }
                    else {
                        itemFoundInArray.Total++;
                    }
                }
            }

        }
        return faults;
    }

    //maak array met tellingen van alle fouten bij elementen
    this.getAllFailures_NicExtra = function () {
        var faulttypesUnion = [];
        for (var i in this.NICAuditRooms) {
            var auditRoom = this.NICAuditRooms[i];
            if (!(auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished || auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished)) continue;

            for (var j in auditRoom.AuditElements) {
                var result = auditRoom.AuditElements[j];
                if (result.Number3 > 0) {
                    //fouten worden per element opgeslagen als string (, - separated)
                    //var faultIdsString = result.faultTypeIds_PO + result.faultTypeIds_DO;
                    //var faultIds = faultIdsString.split(",");
                    for (var i in result.FaultTypes) {
                        var faultType = result.FaultTypes[i];
                        var id = faultType.FaultTypeId;

                        //als fout al eerder in array zat dan 1 optellen, anders nieuwe aanmaken
                        var faultIdFoundInArray = findInArray(faulttypesUnion, "Id", faultType.FaultTypeId);
                        if (!faultIdFoundInArray) {
                            var newFaultType = { Id: faultType.FaultTypeId, Name: faultType.Name, Total: faultType.NumberOfFaults };
                            faulttypesUnion.push(newFaultType);
                        }
                        else {
                            faultIdFoundInArray.Total += faultType.NumberOfFaults;
                        }

                    }

                }
            }
        }
        return faulttypesUnion;
    }

    //maak array aan van aantallen van alle elementen in alle ruimtes met een fout 
    this.getAllElementsWithFailures = function () {
        //vullen tabel
        var elementsWithFailures = [];
        for (var i in this.NICAuditRooms) {
            var auditRoom = this.NICAuditRooms[i];
            if (!(auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.Finished || auditRoom.Ind_Gemeten == NicModel.DatabaseIDs.AuditRoomStatus.BackupFinished)) continue;

            for (var j in auditRoom.AuditElements) {
                var result = auditRoom.AuditElements[j];
                if (result.Number3 > 0) {
                    var element = NicModel.StaticData.GetById("Elements", result.ElementId);

                    var elementFoundInArray = findInArray(elementsWithFailures, "ElementId", result.ElementId);
                    if (!elementFoundInArray) {
                        var newElementsWithFailures = { ElementId: result.ElementId, ElementName: element.Name, Total: result.Number3 };
                        elementsWithFailures.push(newElementsWithFailures);
                    }
                    else {
                        elementFoundInArray.Total += result.Number3;
                    }
                }
            }
        }
        return elementsWithFailures;
    }

    this.isValid = function (totalValid) {
        //todo: refactor: eigenlijk zou nicApp niet bekend mogen zijn in deze Model class
        var isValid = true;
        if (!nicApp.currentAudit.ClientContactPerson || nicApp.currentAudit.ClientContactPerson == "") {
            nicApp.addMessage("noCustomer" + this.Id, this.toString() + ": Er is geen contactpersoon van de klant ingevuld.")
            isValid = false;
        }
        else {
            nicApp.removeMessage("noCustomer" + this.Id);
        }
        if (!nicApp.currentAudit.SupplierContactPerson || nicApp.currentAudit.SupplierContactPerson == "") {
            nicApp.addMessage("noSupplier" + this.Id, this.toString() + ": Er is geen contactpersoon van de leverancier ingevuld.")
            isValid = false;
        }
        else {
            nicApp.removeMessage("noSupplier" + this.Id);
        }
        //voor afsluiten van audit totalValid = true
        if (totalValid) {
            if (this.countUnfinishedRoomsInSample() > 0) {
                nicApp.addMessage("unfinishedRooms" + this.Id, this.toString() + ": Nog niet alle ruimtes zijn gecontroleerd!");
                isValid = false;
            }
            else {
                nicApp.removeMessage("unfinishedRooms" + this.Id);
            }
            nicApp.removeMessage("noValidSignatures" + this.Id);
            if (!this.NoSignClient && this.SignatureClient.length < 1000) {
                nicApp.addMessage("noValidSignatureClient" + this.Id, "Ondertekenen door klant is verplicht.")
                isValid = false;
            }
            if (!this.NoSignSupplier && this.SignatureSupplier.length < 1000) {
                nicApp.addMessage("noValidSignatureSupplier" + this.Id, "Ondertekenen door aannemer is verplicht.")
                isValid = false;
            }
            if (this.SignatureInspector.length < 1000) {
                nicApp.addMessage("noValidSignatureInspector" + this.Id, "Ondertekenen door inspecteur is verplicht.")
                isValid = false;
            }
        }
        return isValid
    }

    this.close = function () {
        this.AuditStateId = NicModel.DatabaseIDs.Status.Closed;
        //eindtijd wordt nu gezet na ondertekenen, want inspecteurs sluiten soms pas thuis de meting af.
        //this.TimeFinish = new Date();
        nicApp.db.saveAudit(toJSON(this));
    }


};

NicModel.Audit.prototype.toString = function () {
    var returnValue = this.Object.Name;
    returnValue += " (" + this.Object.AddressStreet + " " + this.Object.AddressNumber.toString() + this.Object.AddressNumberAdd + ", " + this.Object.Town + ")";
    return returnValue;
}

NicModel.AuditResult = function () {
}

NicModel.AuditRoomCategory = function (auditId, roomcategory) {
    this.Id = generateUUID();
    this.NICAuditId = auditId.Id;
    this.NICRoomCategoryId = roomcategory.Id;
    this.Description = roomcategory.Description;
    this.Abbreviation = roomcategory.Abbreviation;
    this.M2BE = roomcategory.M2BE;
    this.IndWerkVerblijfVerkeer = roomcategory.IndWerkVerblijfVerkeer;
    this.TotalM2NeededInSample = 0;
    this.TotalM2InBuilding = 0;
    this.TotalM2InSample = 0;
    this.TotalM2Finished = 0;
    this.NumberOf3 = 0;
    this.NumberOf6 = 0;
    this.NumberOf8 = 0;
    this.NumberTotal = 0;
    this.NumberOfFaultsPO = 0;
    this.NumberOfFaultsDO = 0;
    this.Score = 0;
}

NicModel.AuditRoom = function () {


    //this.RoomIndications = {
    //    wvv: 'wvv', //wvv = WVV (Werk/verkeer/verblijf)
    //    sanitair: 'sanitair'
    //};

    this.createFromRoom = function (room, audit) {
        this.TotalInspectionResult = '';

        this.Id = generateUUID();

        this.RoomId = room.Id;
        this.AuditId = audit.Id;
        this.Area = room.Area;
        this.Ind_Steekproef = 1;
        this.Ind_Gemeten = 0;
        this.RoomNumber = room.RoomNumber;
        this.RoomDescription = room.RoomDescription;
        this.BuildingId = room.BuildingId;
        this.FloorId = room.FloorId;
        this.BuildingName = room.BuildingName;
        this.FloorName = room.FloorName;
        this.BuildingSortOrder = room.BuildingSortOrder;
        this.FloorSortOrder = room.FloorSortOrder;
        this.NICRoomCategoryId = room.NICRoomCategoryId;
        this.NICRoomCategory = NicModel.StaticData.GetById("RoomCategories", room.NICRoomCategoryId);
        this.RoomIndication = (this.NICRoomCategory.IndWerkVerblijfVerkeer == 1) ? "wvv" : "sanitair";
        this.BE = Math.ceil(this.Area / this.NICRoomCategory.M2BE);
        this.NICAuditSystemId = audit.NICAuditSystemId;
        this.TotalInspectionResult = 'G';
        this.NICAuditRoomInventories = [];


        //nicExtra: aantallen per element van laatste meting
        this.NICRoomInventories = Enumerable.From(audit.NICRoomInventories).Where("$.RoomId=="+ room.Id).ToArray();

        for (var areaOfAttentionName in NicModel.DatabaseIDs.AreasOfAttention[this.RoomIndication]) {
            var auditRoomInventory = new NicModel.AuditRoomInventory();
            auditRoomInventory.AreaOfAttentionId = NicModel.DatabaseIDs.AreasOfAttention[this.RoomIndication][areaOfAttentionName];
            auditRoomInventory.ResultId = NicModel.DatabaseIDs.Results.G;
            auditRoomInventory.M2 = this.Area;
            //extra vars voor js
            auditRoomInventory.AreaOfAttentionName = areaOfAttentionName;
            auditRoomInventory.RoomIndication = this.RoomIndication;
            auditRoomInventory.Result = 'G';
            this.NICAuditRoomInventories.push(auditRoomInventory);
        }
        return this;
    }

    this.isValid = function () {
        var isValid = true;
        //validate

        return isValid;
    }

    //kijk naar totaal oordeel van de ruimte, laagste oordeel geldt
    this.calcTotalInspectionResult = function () {
        this.TotalInspectionResult = 'G'; //= 8

        if (this.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicExtra) {
            var results = this.getNicExtraResultsTotals();
            if (results.Number3 > 0) {
                this.TotalInspectionResult = 'A';
            }
            //else {
            //    score = (6 * results.number6 + 8 * results.number8) / (results.number6 + results.number8);
            //    if (score < 7.2) {
            //        this.TotalInspectionResult = 'O';
            //    }
            //}
        }
        else if (this.NICAuditSystemId == NicModel.DatabaseIDs.NICAuditSystems.NicPlus) {
            var max = 0; //laagste oordeel is hoogste nummer
            for (var i in this.NICAuditRoomInventories) {
                var roomResult = this.NICAuditRoomInventories[i];
                if (roomResult.ResultId > max) {
                    max = roomResult.ResultId;
                }
            }
            if (max == NicModel.DatabaseIDs.Results.O) {
                this.TotalInspectionResult = 'O';
            }
            else if (max == NicModel.DatabaseIDs.Results.A) {
                this.TotalInspectionResult = 'A';
            }
        }

    }

    this.getNicExtraResultsTotals = function () {
        var totalResult = { NumberTotal: 0, Number3: 0, Number6: 0, Number8: 0, NumberFaultsPO: 0, NumberFaultsDO: 0 };

        for (var i in this.AuditElements) {
            var elementResult = this.AuditElements[i]
            totalResult.Number3 += elementResult.Number3;
            totalResult.Number6 += elementResult.Number6;
            totalResult.Number8 += elementResult.Number8;
            totalResult.NumberTotal += elementResult.NumberTotal;
            totalResult.NumberFaultsPO += Enumerable.From(elementResult.FaultTypes).Where("$.Ind_PODO = 'PO'").Sum("$.NumberOfFaults");
            totalResult.NumberFaultsDO += Enumerable.From(elementResult.FaultTypes).Where("$.Ind_PODO = 'DO'").Sum("$.NumberOfFaults");
        }

        return totalResult;
    }

    this.getElementById = function (elementId) {
        if (!this.AuditElements) this.AuditElements = [];
        var element = findInArray(this.AuditElements, "ElementId", elementId)
        if (!element) {
            element = { ElementId: elementId, Name: "", NumberTotal: 0, Number3: 0, Number6: 0, Number8: 0, FaultTypes: [] };
            //kijken naar vorige meting
            var lastCount = findInArray(this.NICRoomInventories, "ElementId", elementId);
            if (lastCount) {
                element.NumberTotal = lastCount.Number;
                element.Number6 = lastCount.Number;
            }
            this.AuditElements.push(element);
        }
        return element;
    }

    self = this;
}

NicModel.AuditRoomInventory = function () {
}

NicModel.AuditRoomFault = function () {
}

//voor NicExtra
NicModel.AuditRoomElement = function () {
}

NicModel.AuditRoom.prototype.toString = function () {
    var returnValue = this.RoomDescription;
    if (this.RoomNumber && this.RoomNumber != "") {
        returnValue += " - " + this.RoomNumber;
    }
    returnValue += " (" + this.Area + "m2)";
    return returnValue;
}

NicModel.StaticData = {};

NicModel.StaticData.IsLoaded = function () {
    return NicModel.StaticData.AuditStates ? NicModel.StaticData.AuditStates.length > 0 : false;
}

NicModel.StaticData.GetById = function (listName, id) {
    var queryResult = Enumerable.From(NicModel.StaticData[listName])
            .Where("$.Id == " + id);

    return queryResult.SingleOrDefault();
}

NicModel.StaticData.GetValues = function (listName, where) {
    var queryResult = Enumerable.From(NicModel.StaticData[listName])
            .Where(where);

    return queryResult.ToArray();
}

NicModel.StaticData.GetFirstValue = function (listName, where) {
    var queryResult = Enumerable.From(NicModel.StaticData[listName])
            .Where(where);

    return queryResult.FirstOrDefault();
}

NicModel.StaticData.NICAuditSampleSizes = [];

NicModel.StaticData.NICAuditSampleSizes.GetByRoomCategoryId = function (roomCategoryId) {
    var queryResult = Enumerable.From(NicModel.StaticData.NICAuditSampleSizes)
            .Where("$.NICRoomCategoryId == " + roomCategoryId);

    var retValue = queryResult.ToArray();
    return queryResult.SingleOrDefault();

}

NicModel.DatabaseIDs = {};
NicModel.DatabaseIDs.Results = { G: 1, O: 2, A: 3 };
NicModel.DatabaseIDs.AreasOfAttention = { wvv: { floors: 1, interior: 2, inventory: 3 }, sanitair: { floors: 4, interior: 5, inventory: 6 } };
NicModel.DatabaseIDs.Status = { NewOpen: 0, SampleTest: 1, AllRoomsFinished: 2, Calculated: 3, Signed: 4, Closed: 9, Sent: 99 };
//status
//0	1	Niet gelopen
//1	1	Steekproef
//2	1	Alles gemeten
//3	1	Score bepaald
//4	1	Handtekeningen
//5	1	UitsluitenRuimten
//9	1	Afgesloten

//veld Ind_Gemeten in database
NicModel.DatabaseIDs.AuditRoomStatus = { UnFinished: 0, Finished: 1, Occupied: 2, Backup: 4, BackupFinished: 5 };
NicModel.DatabaseIDs.NICAuditSystems = { NicExtra: 1, NicPlus: 3 };