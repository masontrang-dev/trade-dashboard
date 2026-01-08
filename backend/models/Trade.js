const { getDb } = require("./database");
const {
  calculateProfitLoss,
  calculateTaxAmount,
  calculateMarginInterest,
  calculateDaysHeld,
  calculateNetProfit,
  calculateRMultiple,
  determineWinLoss,
} = require("../../shared/tradeCalculations");

class Trade {
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.all("SELECT * FROM trades ORDER BY entryTime DESC", (err, rows) => {
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
      const db = getDb();
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
      const db = getDb();
      // Set default values and validate
      const tradeType = (tradeData.type || "LONG").toUpperCase();
      if (tradeType !== "LONG" && tradeType !== "SHORT") {
        reject(new Error("Type must be either LONG or SHORT"));
        return;
      }

      const {
        symbol,
        quantity,
        entryPrice,
        stopLoss,
        targetPrice1,
        targetPrice2,
        notes,
        riskAmount,
        rSize,
        tradingMode,
      } = tradeData;

      // Round riskAmount to 2 decimal places to avoid floating-point precision issues
      const roundedRiskAmount = riskAmount
        ? Math.round(riskAmount * 100) / 100
        : null;

      const sql = `
        INSERT INTO trades (
          symbol, type, quantity, entryPrice, stopLoss, 
          targetPrice1, targetPrice2, notes, riskAmount, rSize, tradingMode, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
      `;

      db.run(
        sql,
        [
          symbol,
          tradeType,
          quantity,
          entryPrice,
          stopLoss,
          targetPrice1 || null,
          targetPrice2 || null,
          notes || null,
          roundedRiskAmount,
          rSize || null,
          tradingMode || null,
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
      const db = getDb();
      const fields = [];
      const values = [];

      Object.keys(tradeData).forEach((key) => {
        if (tradeData[key] !== undefined) {
          // Round riskAmount to 2 decimal places to avoid floating-point precision issues
          const value =
            key === "riskAmount" && tradeData[key] !== null
              ? Math.round(tradeData[key] * 100) / 100
              : tradeData[key];
          fields.push(`${key} = ?`);
          values.push(value);
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
      )}, updatedAt = ? WHERE id = ?`;

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
      const db = getDb();
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
      const db = getDb();
      this.getById(id)
        .then((trade) => {
          if (!trade) {
            reject(new Error("Trade not found"));
            return;
          }

          const pnl = calculateProfitLoss(
            trade.type,
            trade.entryPrice,
            exitPrice,
            trade.quantity
          );

          const pnlPercent = (pnl / (trade.entryPrice * trade.quantity)) * 100;
          const rMultiple = calculateRMultiple(pnl, trade.riskAmount);

          const taxAmount = calculateTaxAmount(
            pnl,
            trade.stateTaxRate || 0,
            trade.federalTaxRate || 0
          );

          const positionSize =
            trade.positionSize || trade.entryPrice * trade.quantity;

          // Use custom close date if provided, otherwise use current time
          const exitDate = additionalData.closeDate
            ? new Date(additionalData.closeDate)
            : new Date();

          const daysHeld = calculateDaysHeld(trade.entryTime, exitDate);
          const marginInterest = calculateMarginInterest(
            positionSize,
            trade.marginInterestRate || 0,
            daysHeld
          );

          const netProfit = calculateNetProfit(pnl, taxAmount, marginInterest);

          const now = new Date().toISOString();
          const exitTime = additionalData.closeDate
            ? new Date(additionalData.closeDate).toISOString()
            : now;

          const sql = `
          UPDATE trades 
          SET 
            status = 'CLOSED',
            exitPrice = ?,
            profitLoss = ?,
            taxAmount = ?,
            marginInterest = ?,
            exitTime = ?,
            updatedAt = ?
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

    const pnl = trade.profitLoss || 0;
    const entryValue = trade.entryPrice * trade.quantity;
    const pnlPercent = entryValue > 0 ? (pnl / entryValue) * 100 : 0;
    const rMultiple = calculateRMultiple(pnl, trade.riskAmount);
    const winLoss = determineWinLoss(pnl);

    const taxAmount = trade.taxAmount || calculateTaxAmount(pnl, 0, 25);
    const marginInterest = trade.marginInterest || 0;
    const netProfit = calculateNetProfit(pnl, taxAmount, marginInterest);

    return {
      pnl,
      pnlPercent,
      rMultiple,
      winLoss,
      taxAmount,
      marginInterest,
      netProfit,
      positionSize: trade.positionSize || trade.entryPrice * trade.quantity,
    };
  }

  static async getOpenPositions() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      console.log("Fetching open positions from database...");
      db.all(
        'SELECT * FROM trades WHERE status = "OPEN" ORDER BY entryTime DESC',
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
      const db = getDb();
      console.log("Fetching closed trades from database...");
      db.all(
        'SELECT * FROM trades WHERE status = "CLOSED" ORDER BY exitTime DESC',
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
