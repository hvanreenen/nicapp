/// <autosync enabled="true" />
/// <reference path="linq/jquery.linq.js" />
/// <reference path="linq/linq.js" />
/// <reference path="nicdb.js" />
/// <reference path="nicmodel.js" />
/// <reference path="nicutils.js" />
/// <reference path="../test.js" />
/// <reference path="bootstrap/bootstrap.js" />
/// <reference path="jquery/jquery-1.10.2.js" />
/// <reference path="modernizr/modernizr-2.6.2.js" />
/// <reference path="respond/respond.js" />
/// <reference path="jquery/jquery.mobile/jquery.mobile-1.4.5.js" />
/// <reference path="ydn-db/config/conn.js" />
/// <reference path="ydn-db/config/crud.js" />
/// <reference path="ydn-db/config/dev.js" />
/// <reference path="ydn-db/config/main.js" />
/// <reference path="ydn-db/config/storage.js" />
/// <reference path="ydn-db/config/test.js" />
/// <reference path="ydn-db/externs/entity.js" />
/// <reference path="ydn-db/externs/misc.js" />
/// <reference path="ydn-db/externs/schema.js" />
/// <reference path="ydn-db/externs/storage.js" />
/// <reference path="ydn-db/externs/websql.js" />
/// <reference path="ydn-db/jsc/ydn.db-dev.js" />
/// <reference path="ydn-db/src/storage.js" />
/// <reference path="ydn-db/src/ydn/db/algo/abstract_solver.js" />
/// <reference path="ydn-db/src/ydn/db/algo/algo.js" />
/// <reference path="ydn-db/src/ydn/db/algo/exports.js" />
/// <reference path="ydn-db/src/ydn/db/algo/nested_loop.js" />
/// <reference path="ydn-db/src/ydn/db/algo/sorted_merge.js" />
/// <reference path="ydn-db/src/ydn/db/algo/zigzag_merge.js" />
/// <reference path="ydn-db/src/ydn/db/base/base.js" />
/// <reference path="ydn-db/src/ydn/db/base/db.js" />
/// <reference path="ydn-db/src/ydn/db/base/error.js" />
/// <reference path="ydn-db/src/ydn/db/base/events.js" />
/// <reference path="ydn-db/src/ydn/db/base/key.js" />
/// <reference path="ydn-db/src/ydn/db/base/key_range.js" />
/// <reference path="ydn-db/src/ydn/db/base/mutax.js" />
/// <reference path="ydn-db/src/ydn/db/base/request.js" />
/// <reference path="ydn-db/src/ydn/db/base/utils.js" />
/// <reference path="ydn-db/src/ydn/db/base/where.js" />
/// <reference path="ydn-db/src/ydn/db/base/schema/database.js" />
/// <reference path="ydn-db/src/ydn/db/base/schema/editable_schema.js" />
/// <reference path="ydn-db/src/ydn/db/base/schema/index.js" />
/// <reference path="ydn-db/src/ydn/db/base/schema/store.js" />
/// <reference path="ydn-db/src/ydn/db/base/schema/fulltext/catalog.js" />
/// <reference path="ydn-db/src/ydn/db/base/schema/fulltext/engine.js" />
/// <reference path="ydn-db/src/ydn/db/base/schema/fulltext/entry.js" />
/// <reference path="ydn-db/src/ydn/db/base/schema/fulltext/invindex.js" />
/// <reference path="ydn-db/src/ydn/db/conn/exports.js" />
/// <reference path="ydn-db/src/ydn/db/conn/indexed_db.js" />
/// <reference path="ydn-db/src/ydn/db/conn/i_database.js" />
/// <reference path="ydn-db/src/ydn/db/conn/i_storage.js" />
/// <reference path="ydn-db/src/ydn/db/conn/storage.js" />
/// <reference path="ydn-db/src/ydn/db/conn/websql.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/base.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/index_node.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/i_web_stroage.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/memory_storage.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/simple_storage.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/simple_storage_service.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/store.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/tx_storage.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/user_data.js" />
/// <reference path="ydn-db/src/ydn/db/conn/simple/web_storage.js" />
/// <reference path="ydn-db/src/ydn/db/core/abstract-iterator.js" />
/// <reference path="ydn-db/src/ydn/db/core/exports.js" />
/// <reference path="ydn-db/src/ydn/db/core/idb_cursor_stream.js" />
/// <reference path="ydn-db/src/ydn/db/core/inject.js" />
/// <reference path="ydn-db/src/ydn/db/core/iterator.js" />
/// <reference path="ydn-db/src/ydn/db/core/i_cursor_stream.js" />
/// <reference path="ydn-db/src/ydn/db/core/i_operator.js" />
/// <reference path="ydn-db/src/ydn/db/core/operator.js" />
/// <reference path="ydn-db/src/ydn/db/core/storage.js" />
/// <reference path="ydn-db/src/ydn/db/core/streamer.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/abstract_cursor.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/cached_websql_cursor.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/idb_cursor.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/indexed_db.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/i_cursor.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/i_request_executor.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/simple_cursor.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/simple_store.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/websql.js" />
/// <reference path="ydn-db/src/ydn/db/core/req/websql_cursor.js" />
/// <reference path="ydn-db/src/ydn/db/crud/exports.js" />
/// <reference path="ydn-db/src/ydn/db/crud/inject.js" />
/// <reference path="ydn-db/src/ydn/db/crud/i_operator.js" />
/// <reference path="ydn-db/src/ydn/db/crud/operator.js" />
/// <reference path="ydn-db/src/ydn/db/crud/storage.js" />
/// <reference path="ydn-db/src/ydn/db/crud/req/indexed_db.js" />
/// <reference path="ydn-db/src/ydn/db/crud/req/i_request_executor.js" />
/// <reference path="ydn-db/src/ydn/db/crud/req/request_executor.js" />
/// <reference path="ydn-db/src/ydn/db/crud/req/simple_store.js" />
/// <reference path="ydn-db/src/ydn/db/crud/req/websql.js" />
/// <reference path="ydn-db/src/ydn/db/query/basic-query.js" />
/// <reference path="ydn-db/src/ydn/db/query/conj-query.js" />
/// <reference path="ydn-db/src/ydn/db/query/conjunction-cursor.js" />
/// <reference path="ydn-db/src/ydn/db/query/conjunction-iterator.js" />
/// <reference path="ydn-db/src/ydn/db/query/exports.js" />
/// <reference path="ydn-db/src/ydn/db/query/helper.js" />
/// <reference path="ydn-db/src/ydn/db/query/iterator.js" />
/// <reference path="ydn-db/src/ydn/db/query/join.js" />
/// <reference path="ydn-db/src/ydn/db/query/primary-key-conj-cursor.js" />
/// <reference path="ydn-db/src/ydn/db/query/query.js" />
/// <reference path="ydn-db/src/ydn/db/query/secondary-key-conj-cursor.js" />
/// <reference path="ydn-db/src/ydn/db/sql/exports.js" />
/// <reference path="ydn-db/src/ydn/db/sql/inject.js" />
/// <reference path="ydn-db/src/ydn/db/sql/i_storage.js" />
/// <reference path="ydn-db/src/ydn/db/sql/operator.js" />
/// <reference path="ydn-db/src/ydn/db/sql/sql.js" />
/// <reference path="ydn-db/src/ydn/db/sql/storage.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/idb_query.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/indexed_db.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/iterable_query.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/i_request_executor.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/simple_store.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/sql_old.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/sql_query.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/websql.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/nosql/node.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/nosql/reduce_node.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/websql/node.js" />
/// <reference path="ydn-db/src/ydn/db/sql/req/websql/reduce_node.js" />
/// <reference path="ydn-db/src/ydn/db/tr/atomic_parallel.js" />
/// <reference path="ydn-db/src/ydn/db/tr/atomic_serial.js" />
/// <reference path="ydn-db/src/ydn/db/tr/events_exports.js" />
/// <reference path="ydn-db/src/ydn/db/tr/event_installer.js" />
/// <reference path="ydn-db/src/ydn/db/tr/exports.js" />
/// <reference path="ydn-db/src/ydn/db/tr/inject.js" />
/// <reference path="ydn-db/src/ydn/db/tr/mutex.js" />
/// <reference path="ydn-db/src/ydn/db/tr/operator.js" />
/// <reference path="ydn-db/src/ydn/db/tr/parallel.js" />
/// <reference path="ydn-db/src/ydn/db/tr/parallel_tx_executor.js" />
/// <reference path="ydn-db/src/ydn/db/tr/serial.js" />
/// <reference path="ydn-db/src/ydn/db/tr/storage.js" />
/// <reference path="ydn-db/src/ydn/db/tr/thread.js" />
/// <reference path="ydn-db/src/ydn/db/utils/reader.js" />
/// <reference path="ydn-db/src/ydn/db/utils/shoper.js" />
/// <reference path="ydn-db/src/ydn/db/utils/test_utils.js" />
/// <reference path="jquery/jquery.sketchpad.js" />
/// <reference path="auditselectionpage.js" />
/// <reference path="auditdetailspage.js" />
/// <reference path="roomdetailspage.js" />
/// <reference path="roomselectionpage.js" />
/// <reference path="advicespage.js" />
/// <reference path="auditremarkspage.js" />
/// <reference path="closeauditpage.js" />
/// <reference path="finalreportpage.js" />
/// <reference path="notespage.js" />
/// <reference path="roomremarkspage.js" />
/// <reference path="samplepage.js" />
/// <reference path="signauditpage.js" />
/// <reference path="syncpage.js" />
/// <reference path="nicapp.js" />
/// <reference path="chart.js-master/chart.min.js" />
/// <reference path="faulttypespage.js" />




















































































