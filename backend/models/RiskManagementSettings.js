const db = require("./database");

class RiskManagementSettings {
  static async get() {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM risk_management_settings ORDER BY id DESC LIMIT 1",
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  static async update(settings) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      Object.keys(settings).forEach((key) => {
        if (settings[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(settings[key]);
        }
      });

      if (fields.length === 0) {
        reject(new Error("No fields to update"));
        return;
      }

      values.push(new Date().toISOString());

      const sql = `UPDATE risk_management_settings SET ${fields.join(
        ", "
      )}, updated_at = ? WHERE id = 1`;

      db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }
}

module.exports = RiskManagementSettings;
