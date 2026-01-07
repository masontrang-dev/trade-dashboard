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

  static async close(id, exitPrice) {
    return new Promise((resolve, reject) => {
      // First get the trade to calculate P&L
      this.getById(id)
        .then((trade) => {
          if (!trade) {
            reject(new Error("Trade not found"));
            return;
          }

          // Calculate P&L
          let pnl;
          if (trade.type === "LONG") {
            pnl = (exitPrice - trade.entry_price) * trade.quantity;
          } else {
            // SHORT
            pnl = (trade.entry_price - exitPrice) * trade.quantity;
          }

          // Update the trade with exit price, P&L and close it
          const now = new Date().toISOString();
          const sql = `
          UPDATE trades 
          SET 
            status = 'CLOSED',
            exit_price = ?,
            profit_loss = ?,
            exit_time = ?,
            updated_at = ?
          WHERE id = ?
        `;

          db.run(sql, [exitPrice, pnl, now, now, id], function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, changes: this.changes, pnl });
            }
          });
        })
        .catch(reject);
    });
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
