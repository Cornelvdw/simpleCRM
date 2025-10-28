const sql = require('mssql');

module.exports = async function (context, req) {
  const b = req.body || {};
  if(!b.Id){ context.res = { status:400, body:'Id required' }; return; }

  try {
    const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
    const q = `UPDATE Leads SET
                Client = @Client,
                SalesRep = @SalesRep,
                Stage = @Stage,
                ValueMonthly = @ValueMonthly,
                ExpectedCloseDate = @ExpectedCloseDate
               WHERE Id = @Id`;
    const request = pool.request()
      .input('Client', sql.NVarChar(200), b.Client || null)
      .input('SalesRep', sql.NVarChar(200), b.SalesRep || null)
      .input('Stage', sql.NVarChar(100), b.Stage || null)
      .input('ValueMonthly', sql.Decimal(18,2), b.ValueMonthly !== undefined && b.ValueMonthly !== null ? parseFloat(b.ValueMonthly) : null)
      .input('ExpectedCloseDate', sql.Date, b.ExpectedCloseDate || null)
      .input('Id', sql.Int, parseInt(b.Id,10));

    await request.query(q);
    context.res = { status:200, body:'OK' };
  } catch(err){
    context.log.error(err);
    context.res = { status:500, body:'Error updating' };
  } finally { try{ await sql.close(); }catch(e){} }
};
