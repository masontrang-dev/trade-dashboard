const db = require("./database");

class Trade {
  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM trades ORDER BY entry_time DESC", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM trades WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async create(tradeData) {
    return new Promise((resolve, reject) => {
      // Set default values and validate
      const tradeType = (tradeData.type || "LONG").toUpperCase();
      if (tradeType !== "LONG" && tradeType !== "SHORT") {
        reject(new Error("Type must be either LONG or SHORT"));
        return;
      }

      const {
        symbol,
        quantity,
        entry_price,
        stop_loss,
        take_profit,
        notes,
        risk_amount,
        r_size,
      } = tradeData;

      const sql = `
        INSERT INTO trades (
          symbol, type, quantity, entry_price, stop_loss, 
          take_profit, notes, risk_amount, r_size, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
      `;

      db.run(
        sql,
        [
          symbol,
          tradeType,
          quantity,
          entry_price,
          stop_loss,
          take_profit,
          notes || null,
          risk_amount || null,
          r_size || null,
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  }

  static async update(id, tradeData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      Object.keys(tradeData).forEach((key) => {
        if (tradeData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(tradeData[key]);
        }
      });

      if (fields.length === 0) {
        reject(new Error("No fields to update"));
        return;
      }

      values.push(new Date().toISOString());
      values.push(id);

      const sql = `UPDATE trades SET ${fields.join(
        ", "
      )}, updated_at = ? WHERE id = ?`;

      db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM trades WHERE id = ?", [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static async close(id, exitPrice, additionalData = {}) {
    return new Promise((resolve, reject) => {
      this.getById(id)
        .then((trade) => {
          if (!trade) {
            reject(new Error("Trade not found"));
            return;
          }

          let pnl;
          if (trade.type === "LONG") {
            pnl = (exitPrice - trade.entry_price) * trade.quantity;
          } else {
            pnl = (trade.entry_price - exitPrice) * trade.quantity;
          }

          const pnlPercent = (pnl / (trade.entry_price * trade.quantity)) * 100;
          const rMultiple =
            trade.risk_amount && trade.risk_amount > 0
              ? pnl / trade.risk_amount
              : 0;

          const stateTaxRate = trade.state_tax_rate || 0;
          const federalTaxRate = trade.federal_tax_rate || 0;
          const combinedTaxRate = (stateTaxRate + federalTaxRate) / 100;
          const taxAmount = pnl > 0 ? pnl * combinedTaxRate : 0;

          const positionSize =
            trade.position_size || trade.entry_price * trade.quantity;
          const marginRate = (trade.margin_interest_rate || 0) / 100;
          const entryDate = new Date(trade.entry_time);

          // Use custom close date if provided, otherwise use current time
          const exitDate = additionalData.closeDate
            ? new Date(additionalData.closeDate)
            : new Date();

          const daysHeld = Math.max(
            1,
            Math.ceil((exitDate - entryDate) / (1000 * 60 * 60 * 24))
          );
          const marginInterest = ((positionSize * marginRate) / 360) * daysHeld;

          const netProfit = pnl - taxAmount - marginInterest;

          const now = new Date().toISOString();
          const exitTime = additionalData.closeDate
            ? new Date(additionalData.closeDate).toISOString()
            : now;

          const sql = `
          UPDATE trades 
          SET 
            status = 'CLOSED',
            exit_price = ?,
            profit_loss = ?,
            tax_amount = ?,
            margin_interest = ?,
            exit_time = ?,
            updated_at = ?
          WHERE id = ?
        `;

          db.run(
            sql,
            [exitPrice, pnl, taxAmount, marginInterest, exitTime, now, id],
            function (err) {
              if (err) {
                reject(err);
              } else {
                resolve({
                  id,
                  changes: this.changes,
                  pnl,
                  pnlPercent,
                  rMultiple,
                  taxAmount,
                  marginInterest,
                  netProfit,
                  daysHeld,
                });
              }
            }
          );
        })
        .catch(reject);
    });
  }

  static calculateMetrics(trade) {
    if (!trade) return null;

    const pnl = trade.profit_loss || 0;
    const entryValue = trade.entry_price * trade.quantity;
    const pnlPercent = entryValue > 0 ? (pnl / entryValue) * 100 : 0;
    const rMultiple =
      trade.risk_amount && trade.risk_amount > 0 ? pnl / trade.risk_amount : 0;
    const winLoss = pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BREAKEVEN";

    const taxAmount = trade.tax_amount || (pnl > 0 ? pnl * 0.25 : 0);
    const marginInterest = trade.margin_interest || 0;
    const netProfit = pnl - taxAmount - marginInterest;

    return {
      pnl,
      pnlPercent,
      rMultiple,
      winLoss,
      taxAmount,
      marginInterest,
      netProfit,
      positionSize: trade.position_size || trade.entry_price * trade.quantity,
    };
  }

  static async getOpenPositions() {
    return new Promise((resolve, reject) => {
      console.log("Fetching open positions from database...");
      db.all(
        'SELECT * FROM trades WHERE status = "OPEN" ORDER BY entry_time DESC',
        (err, rows) => {
          if (err) {
            console.error("Error fetching open positions:", err);
            return reject(err);
          }
          console.log(`Found ${rows.length} open positions in database`);
          resolve(rows);
        }
      );
    });
  }

  static async getClosedTrades() {
    return new Promise((resolve, reject) => {
      console.log("Fetching closed trades from database...");
      db.all(
        'SELECT * FROM trades WHERE status = "CLOSED" ORDER BY exit_time DESC',
        (err, rows) => {
          if (err) {
            console.error("Error fetching closed trades:", err);
            return reject(err);
          }
          console.log(`Found ${rows.length} closed trades in database`);
          resolve(rows);
        }
      );
    });
  }
}

module.exports = Trade;
