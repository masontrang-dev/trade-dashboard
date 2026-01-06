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
      const {
        symbol,
        type,
        quantity,
        entry_price,
        stop_loss,
        take_profit,
        notes,
      } = tradeData;

      const sql = `
        INSERT INTO trades (
          symbol, type, quantity, entry_price, stop_loss, 
          take_profit, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        sql,
        [symbol, type, quantity, entry_price, stop_loss, take_profit, notes],
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

  static async getOpenPositions() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM trades WHERE status = "OPEN" ORDER BY entry_time DESC',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
}

module.exports = Trade;
