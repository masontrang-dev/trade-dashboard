const { getDb } = require("./database");

class RiskManagementSettings {
  static async get() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get(
        "SELECT * FROM risk_management_settings ORDER BY id ASC LIMIT 1",
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (!row) {
              console.log("No settings found in database, returning defaults");
              // Return default values if no settings exist
              resolve({
                maxDailyLoss: 500,
                maxOpenRisk: 1000,
                maxPositions: 5,
                defaultRSize: 50,
                enableAlerts: true,
                stateTaxRate: 0,
                federalTaxRate: 0,
                marginInterestRate: 0,
              });
              return;
            }

            console.log("Database row:", row);
            resolve(row);
          }
        }
      );
    });
  }

  static async update(settings) {
    console.log("Updating settings with:", settings);
    return new Promise((resolve, reject) => {
      const db = getDb();
      const setClauses = [];
      const values = [];

      // Valid column names in the database
      const validColumns = [
        "maxPositionSize",
        "maxDailyLoss",
        "maxRiskPerTrade",
        "stopLossPercentage",
        "takeProfitPercentage",
        "maxOpenPositions",
        "enableAlerts",
        "defaultRSize",
        "maxOpenRisk",
        "stateTaxRate",
        "federalTaxRate",
        "marginInterestRate",
      ];

      // Build the SET clause with camelCase field names
      Object.entries(settings).forEach(([key, value]) => {
        // Skip invalid column names
        if (!validColumns.includes(key)) {
          console.warn(`Skipping invalid column name: ${key}`);
          return;
        }

        // Convert boolean to 1/0 for SQLite
        const dbValue = typeof value === "boolean" ? (value ? 1 : 0) : value;
        console.log(`Setting ${key} with value:`, dbValue);
        setClauses.push(`${key} = ?`);
        values.push(dbValue);
      });

      if (setClauses.length === 0) {
        const error = new Error("No valid fields to update");
        console.error("Update error:", error.message);
        reject(error);
        return;
      }

      // Add updatedAt to the SET clause and values
      setClauses.push("updatedAt = ?");
      values.push(new Date().toISOString());

      // First, try to update the first record
      const updateSql = `
        UPDATE risk_management_settings 
        SET ${setClauses.join(", ")}
        WHERE id = (SELECT id FROM risk_management_settings ORDER BY id LIMIT 1)
      `;

      console.log("Executing SQL:", updateSql);
      console.log("With values:", values);

      db.run(updateSql, values, function (err) {
        if (err) {
          console.error("Error in update query:", err);
          console.error("SQL was:", updateSql);
          console.error("Values were:", values);
          return reject(err);
        }

        const changes = this.changes;
        console.log("Update callback - changes:", changes);

        // If no rows were updated, try to insert
        if (changes === 0) {
          console.log("No rows updated, attempting to insert new record");
          const insertFields = Object.keys(settings);

          if (insertFields.length === 0) {
            return reject(new Error("No valid fields to insert"));
          }

          const insertValues = Object.values(settings).map((value) =>
            typeof value === "boolean" ? (value ? 1 : 0) : value
          );

          const placeholders = insertFields.map(() => "?").join(", ");
          const insertSql = `
            INSERT INTO risk_management_settings (
              ${insertFields.join(", ")}, 
              createdAt, 
              updatedAt
            ) VALUES (${placeholders}, ?, ?)
          `;

          const insertParams = [
            ...insertValues,
            new Date().toISOString(),
            new Date().toISOString(),
          ];

          console.log("Executing INSERT SQL:", insertSql);
          console.log("With values:", insertParams);

          db.run(insertSql, insertParams, function (insertErr) {
            if (insertErr) {
              console.error("Error in insert query:", insertErr);
              return reject(insertErr);
            }
            console.log("Inserted new record with ID:", this.lastID);

            // Fetch and return the new record
            RiskManagementSettings.get().then(resolve).catch(reject);
          });
        } else {
          console.log("Update successful, changes:", changes);

          // Fetch and return the updated record
          RiskManagementSettings.get().then(resolve).catch(reject);
        }
      });
    });
  }
}

module.exports = RiskManagementSettings;
