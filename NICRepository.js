function NICRepository() {
    var schema = {
        stores: [{
            name: 'NIC.NICAudit',
            keyPath: 'Id'
        }]
    };
    var options =
	{
	    mechanisms: [
			"websql",
			"indexeddb"
	    ]
	}
    this.db = new ydn.db.Storage("NIC", schema, options);
}

NICRepository.prototype.getNICAudit = function (id) {

}

