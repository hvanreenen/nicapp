function BSB() {
	var schema = {
		stores: [{
			name: 'NIC.BSB.Room',
			keyPath: "RuimteId"
		}]
	};
	var options =
	{
		mechanisms: [
			"websql",
			"indexeddb"
			]
	}

	this.db = new ydn.db.Storage('NIC.BSB', schema, options);
//	ydn.debug.log('ydn.db', 'finest');
}