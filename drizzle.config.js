import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: "postgresql",
  schema: './src/db/schema/index.js',
  out: './src/db/migrations',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_atMGxAlYC61y@ep-dry-star-a1g1acfh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  },
  verbose: true,
  strict: true,
});
