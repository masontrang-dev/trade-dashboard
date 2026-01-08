const { getDb } = require("./database");

// Map between frontend camelCase and database snake_case field names
const fieldMap = {
  // Frontend field: Database field
  maxDailyLoss: "max_daily_loss",
  maxOpenRisk: "max_position_size",
  maxPositions: "max_open_positions",
  defaultRSize: "max_risk_per_trade",
  enableAlerts: "enable_alerts",
  stateTaxRate: "state_tax_rate",
  federalTaxRate: "federal_tax_rate",
  marginInterestRate: "margin_interest_rate",
};

// Reverse map for database to frontend
const reverseFieldMap = Object.entries(fieldMap).reduce(
  (acc, [frontend, dbField]) => {
    acc[dbField] = frontend;
    return acc;
  },
  {}
);

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

            console.log("Raw database row:", row);

            // Convert database field names to frontend field names
            const frontendRow = {};
            Object.entries(row).forEach(([dbField, value]) => {
              const frontendField = reverseFieldMap[dbField] || dbField;
              frontendRow[frontendField] = value;
              console.log(
                `Mapping DB field ${dbField} to frontend field ${frontendField} with value:`,
                value
              );
            });

            console.log("Final frontend row:", frontendRow);
            resolve(frontendRow);
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

      // Convert frontend field names to database field names and build the SET clause
      Object.entries(settings).forEach(([key, value]) => {
        if (fieldMap[key] !== undefined) {
          const dbField = fieldMap[key];
          // Convert boolean to 1/0 for SQLite
          const dbValue = typeof value === "boolean" ? (value ? 1 : 0) : value;
          console.log(`Mapping ${key} to ${dbField} with value:`, dbValue);
          setClauses.push(`${dbField} = ?`);
          values.push(dbValue);
        } else {
          console.log(`Skipping field ${key} - not in fieldMap`);
        }
      });

      if (setClauses.length === 0) {
        const error = new Error("No valid fields to update");
        console.error("Update error:", error.message);
        reject(error);
        return;
      }

      // Add updated_at to the SET clause and values
      setClauses.push("updated_at = ?");
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
        const changes = this.changes;
        console.log("Update callback - changes:", changes, "error:", err);

        if (err) {
          console.error("Error in update query:", err);
          return reject(err);
        }

        // If no rows were updated, try to insert
        if (changes === 0) {
          console.log("No rows updated, attempting to insert new record");
          const insertFields = Object.entries(settings)
            .filter(([key]) => fieldMap[key])
            .map(([key]) => fieldMap[key]);

          if (insertFields.length === 0) {
            return reject(new Error("No valid fields to insert"));
          }

          const insertValues = Object.entries(settings)
            .filter(([key]) => fieldMap[key])
            .map(([key, value]) =>
              typeof value === "boolean" ? (value ? 1 : 0) : value
            );

          const placeholders = insertFields.map(() => "?").join(", ");
          const insertSql = `
            INSERT INTO risk_management_settings (
              ${insertFields.join(", ")}, 
              created_at, 
              updated_at
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
