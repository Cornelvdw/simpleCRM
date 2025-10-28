const sql = require('mssql');

module.exports = async function (context, req) {
  const b = req.body || {};
  if(!b.Client){ context.res = { status:400, body:'Client required' }; return; }

  try {
    const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
    const q = `INSERT INTO Leads (Client, DecisionMaker, NextSteps, ContactHistory, ValueMonthly, AnnualValue, Stage, ExpectedCloseDate, Supplier, QuoteNo, Products, SalesRep, Notes)
               VALUES (@Client,@DecisionMaker,@NextSteps,@ContactHistory,@ValueMonthly,@AnnualValue,@Stage,@ExpectedCloseDate,@Supplier,@QuoteNo,@Products,@SalesRep,@Notes)`;
    const reqt = pool.request()
      .input('Client', sql.NVarChar(200), b.Client)
      .input('DecisionMaker', sql.NVarChar(200), b.DecisionMaker || null)
      .input('NextSteps', sql.NVarChar(1000), b.NextSteps || null)
      .input('ContactHistory', sql.NVarChar(2000), b.ContactHistory || null)
      .input('ValueMonthly', sql.Decimal(18,2), b.ValueMonthly !== undefined && b.ValueMonthly !== null ? parseFloat(b.ValueMonthly) : null)
      .input('AnnualValue', sql.Decimal(18,2), b.AnnualValue !== undefined && b.AnnualValue !== null ? parseFloat(b.AnnualValue) : null)
      .input('Stage', sql.NVarChar(100), b.Stage || null)
      .input('ExpectedCloseDate', sql.Date, b.ExpectedCloseDate || null)
      .input('Supplier', sql.NVarChar(200), b.Supplier || null)
      .input('QuoteNo', sql.NVarChar(100), b.QuoteNo || null)
      .input('Products', sql.NVarChar(2000), b.Products || null)
      .input('SalesRep', sql.NVarChar(200), b.SalesRep || null)
      .input('Notes', sql.NVarChar(2000), b.Notes || null);

    await reqt.query(q);
    context.res = { status:200, body: 'OK' };
  } catch(err){
    context.log.error(err);
    context.res = { status:500, body: 'Error saving' };
  } finally {
    try { await sql.close(); } catch(e){}
  }
};
