const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Path to production database
const dbPath = path.join(__dirname, "trades.db");

console.log(
  "Starting migration to add tax rates and recalculate tax/interest..."
);
console.log("Database:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    process.exit(1);
  }
  console.log("Connected to database");
});

// Get default tax and margin rates from risk settings
const getDefaultRates = () => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM risk_management_settings WHERE id = 1",
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            stateTaxRate: row?.state_tax_rate || 0,
            federalTaxRate: row?.federal_tax_rate || 0,
            marginInterestRate: row?.margin_interest_rate || 0,
          });
        }
      }
    );
  });
};

// Update all closed trades with tax rates and recalculated values
const updateClosedTrades = async (defaultRates) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM trades WHERE status = "CLOSED"',
      async (err, trades) => {
        if (err) {
          reject(err);
          return;
        }

        console.log(`Found ${trades.length} closed trades to update`);

        for (const trade of trades) {
          try {
            // Use existing rates if available, otherwise use defaults
            const stateTaxRate =
              trade.state_tax_rate !== null &&
              trade.state_tax_rate !== undefined
                ? trade.state_tax_rate
                : defaultRates.stateTaxRate;
            const federalTaxRate =
              trade.federal_tax_rate !== null &&
              trade.federal_tax_rate !== undefined
                ? trade.federal_tax_rate
                : defaultRates.federalTaxRate;
            const marginInterestRate =
              trade.margin_interest_rate !== null &&
              trade.margin_interest_rate !== undefined
                ? trade.margin_interest_rate
                : defaultRates.marginInterestRate;

            const profitLoss = trade.profit_loss || 0;

            // Calculate tax
            const combinedTaxRate = (stateTaxRate + federalTaxRate) / 100;
            const taxAmount =
              Math.round(
                (profitLoss > 0 ? profitLoss * combinedTaxRate : 0) * 100
              ) / 100;

            // Calculate margin interest
            const positionSize =
              trade.position_size || trade.entry_price * trade.quantity;
            const marginRate = marginInterestRate / 100;
            const entryDate = new Date(trade.entry_time);
            const exitDate = new Date(trade.exit_time);
            const daysHeld = Math.max(
              1,
              Math.ceil((exitDate - entryDate) / (1000 * 60 * 60 * 24))
            );
            const marginInterest =
              Math.round(((positionSize * marginRate) / 360) * daysHeld * 100) /
              100;

            // Update the trade
            await new Promise((resolveUpdate, rejectUpdate) => {
              db.run(
                `UPDATE trades 
               SET state_tax_rate = ?,
                   federal_tax_rate = ?,
                   margin_interest_rate = ?,
                   tax_amount = ?,
                   margin_interest = ?,
                   position_size = ?
               WHERE id = ?`,
                [
                  stateTaxRate,
                  federalTaxRate,
                  marginInterestRate,
                  taxAmount,
                  marginInterest,
                  positionSize,
                  trade.id,
                ],
                (err) => {
                  if (err) {
                    console.error(`Error updating trade ${trade.id}:`, err);
                    rejectUpdate(err);
                  } else {
                    console.log(
                      `Updated trade ${trade.id} (${
                        trade.symbol
                      }): Tax=$${taxAmount.toFixed(
                        2
                      )}, Interest=$${marginInterest.toFixed(2)}`
                    );
                    resolveUpdate();
                  }
                }
              );
            });
          } catch (error) {
            console.error(`Error processing trade ${trade.id}:`, error);
          }
        }

        resolve();
      }
    );
  });
};

// Main migration function
const migrate = async () => {
  try {
    console.log("\nFetching default rates from risk_settings...");
    const defaultRates = await getDefaultRates();
    console.log("Default rates:", defaultRates);

    console.log("\nUpdating closed trades...");
    await updateClosedTrades(defaultRates);

    console.log("\n✅ Migration completed successfully!");

    // Close database
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed");
      }
      process.exit(0);
    });
  } catch (error) {
    console.error("Migration failed:", error);
    db.close();
    process.exit(1);
  }
};

// Run migration
migrate();
