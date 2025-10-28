const sql = require('mssql');

module.exports = async function (context, req) {
  try {
    const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
    const id = req.query.id;
    const salesRep = req.query.salesRep;
    let q = 'SELECT Id, Client, DecisionMaker, Stage, ValueMonthly, ExpectedCloseDate, SalesRep, CreatedAt FROM Leads';
    const request = pool.request();

    if(id) {
      q += ' WHERE Id = @Id';
      request.input('Id', sql.Int, parseInt(id,10));
    } else if(salesRep) {
      q += ' WHERE SalesRep = @SalesRep';
      request.input('SalesRep', sql.NVarChar(200), salesRep);
    }
    q += ' ORDER BY CreatedAt DESC';

    const result = await request.query(q);
    context.res = { status:200, headers:{ 'Content-Type':'application/json' }, body: result.recordset };
  } catch(err){
    context.log.error(err);
    context.res = { status:500, headers:{ 'Content-Type':'application/json' }, body: { message: 'DB error', detail: err.message } };
  } finally { try{ await sql.close(); }catch(e){} }
};
