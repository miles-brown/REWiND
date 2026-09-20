import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("DATABASE_URL not set in environment or .env.local");
  process.exit(1);
}

const SUPABASE_PROD_ROOT_CA = `-----BEGIN CERTIFICATE-----
MIIDxDCCAqygAwIBAgIUbLxMod62P2ktCiAkxnKJwtE9VPYwDQYJKoZIhvcNAQEL
BQAwazELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5l
dyBDYXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJh
c2UgUm9vdCAyMDIxIENBMB4XDTIxMDQyODEwNTY1M1oXDTMxMDQyNjEwNTY1M1ow
azELMAkGA1UEBhMCVVMxEDAOBgNVBAgMB0RlbHdhcmUxEzARBgNVBAcMCk5ldyBD
YXN0bGUxFTATBgNVBAoMDFN1cGFiYXNlIEluYzEeMBwGA1UEAwwVU3VwYWJhc2Ug
Um9vdCAyMDIxIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqQXW
QyHOB+qR2GJobCq/CBmQ40G0oDmCC3mzVnn8sv4XNeWtE5XcEL0uVih7Jo4Dkx1Q
DmGHBH1zDfgs2qXiLb6xpw/CKQPypZW1JssOTMIfQppNQ87K75Ya0p25Y3ePS2t2
GtvHxNjUV6kjOZjEn2yWEcBdpOVCUYBVFBNMB4YBHkNRDa/+S4uywAoaTWnCJLUi
cvTlHmMw6xSQQn1UfRQHk50DMCEJ7Cy1RxrZJrkXXRP3LqQL2ijJ6F4yMfh+Gyb4
O4XajoVj/+R4GwywKYrrS8PrSNtwxr5StlQO8zIQUSMiq26wM8mgELFlS/32Uclt
NaQ1xBRizkzpZct9DwIDAQABo2AwXjALBgNVHQ8EBAMCAQYwHQYDVR0OBBYEFKjX
uXY32CztkhImng4yJNUtaUYsMB8GA1UdIwQYMBaAFKjXuXY32CztkhImng4yJNUt
aUYsMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAB8spzNn+4VU
tVxbdMaX+39Z50sc7uATmus16jmmHjhIHz+l/9GlJ5KqAMOx26mPZgfzG7oneL2b
VW+WgYUkTT3XEPFWnTp2RJwQao8/tYPXWEJDc0WVQHrpmnWOFKU/d3MqBgBm5y+6
jB81TU/RG2rVerPDWP+1MMcNNy0491CTL5XQZ7JfDJJ9CCmXSdtTl4uUQnSuv/Qx
Cea13BX2ZgJc7Au30vihLhub52De4P/4gonKsNHYdbWjg7OWKwNv/zitGDVDB9Y2
CMTyZKG3XEu5Ghl1LEnI3QmEKsqaCLv12BnVjbkSeZsMnevJPs1Ye6TjjJwdik5P
o/bKiIz+Fq8=
-----END CERTIFICATE-----`;

const client = postgres(connectionString, {
  max: 1,
  ssl: {
    ca: SUPABASE_PROD_ROOT_CA,
    rejectUnauthorized: true,
  },
});

const migrationFiles = [
  "20240904000000_supabase_architecture_cutover.sql",
  "20260904010000_temporal_evidence_people_standards.sql",
  "20260904020000_standards_remediation_and_rls.sql",
  "20260904030000_quote_and_claim_rls_hardening.sql",
];

async function applyMigrations() {
  console.log("Connecting to Supabase PostgreSQL database...");
  const [{ version }] = await client`SELECT version()`;
  console.log("Connected to:", version);

  // Ensure supabase_migrations schema/table exists to track applied migrations
  await client`CREATE SCHEMA IF NOT EXISTS supabase_migrations;`;
  await client`
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version text PRIMARY KEY,
      statements text[],
      name text
    );
  `;

  for (const filename of migrationFiles) {
    const filePath = path.join("supabase/migrations", filename);
    const version = filename.split("_")[0];
    const name = filename.replace(/\.sql$/, "").slice(version.length + 1);

    console.log(`\n========================================`);
    console.log(`Applying migration: ${filename} (version: ${version})`);
    console.log(`========================================`);

    const sqlContent = fs.readFileSync(filePath, "utf-8");

    try {
      await client.unsafe(sqlContent);
      await client`
        INSERT INTO supabase_migrations.schema_migrations (version, name)
        VALUES (${version}, ${name})
        ON CONFLICT (version) DO UPDATE SET name = ${name};
      `;
      console.log(` Migration ${filename} applied successfully!`);
    } catch (err) {
      console.error(` Error applying migration ${filename}:`, err);
      process.exit(1);
    }
  }

  // Verify all tables and RLS status
  console.log("\n--- Verification of Database Tables ---");
  const tables = await client`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log(`Found ${tables.length} tables in public schema:`);
  console.log(tables.map((t) => t.table_name).join(", "));

  // Verify RLS policies
  console.log("\n--- Verification of RLS Policies ---");
  const policies = await client`
    SELECT tablename, policyname, qual
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `;
  console.log(`Found ${policies.length} RLS policies:`);
  for (const p of policies) {
    console.log(`- ${p.tablename}: "${p.policyname}"`);
  }

  await client.end();
  console.log("\n All migrations applied and verified successfully!");
}

applyMigrations().catch((err) => {
  console.error("Migration execution failed:", err);
  process.exit(1);
});
