const sql = require('mssql');

module.exports = async function (context, req) {
    const body = req.body || {};

    if (!body.Client) {
        context.res = { status: 400, body: "Client is required" };
        return;
    }

    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);

        const query = `
            INSERT INTO Leads
            (Client, DecisionMaker, NextSteps, ContactHistory, ValueMonthly, AnnualValue, Stage, ExpectedCloseDate, Supplier, QuoteNo, Products)
            VALUES
            (@Client, @DecisionMaker, @NextSteps, @ContactHistory, @ValueMonthly, @AnnualValue, @Stage, @ExpectedCloseDate, @Supplier, @QuoteNo, @Products)
        `;

        const request = pool.request()
            .input('Client', sql.NVarChar(200), body.Client)
            .input('DecisionMaker', sql.NVarChar(200), body.DecisionMaker || null)
            .input('NextSteps', sql.NVarChar(1000), body.NextSteps || null)
            .input('ContactHistory', sql.NVarChar(2000), body.ContactHistory || null)
            .input('ValueMonthly', sql.Decimal(18,2), body.ValueMonthly ? parseFloat(body.ValueMonthly) : null)
            .input('AnnualValue', sql.Decimal(18,2), body.AnnualValue ? parseFloat(body.AnnualValue) : null)
            .input('Stage', sql.NVarChar(100), body.Stage || null)
            .input('ExpectedCloseDate', sql.Date, body.ExpectedCloseDate || null)
            .input('Supplier', sql.NVarChar(200), body.Supplier || null)
            .input('QuoteNo', sql.NVarChar(100), body.QuoteNo || null)
            .input('Products', sql.NVarChar(2000), body.Products || null);

        await request.query(query);

        context.res = { status: 200, body: "Lead saved" };
    } catch (err) {
        context.log.error('SQL error', err);
        context.res = { status: 500, body: "Error saving lead" };
    } finally {
        try { await sql.close(); } catch {}
    }
};
