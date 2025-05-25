/**
 * Script to set up the development environment
 * This file helps configure the connection with Supabase
 */

import { supabase, isUsingMockSupabase } from '../lib/supabase';

/**
 * Checks if the environment is configured correctly
 * @returns An object with the configuration status
 */
export const checkEnvironment = async () => {
  // Check if environment variables are configured
  if (isUsingMockSupabase) {
    return {
      success: false,
      message: 'Environment not configured. Set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables in the .env.local file',
      mockMode: true
    };
  }

  // Test the connection with Supabase
  try {
    const { data, error } = await supabase.from('clients').select('count').single();
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Connection with Supabase successfully established!',
      mockMode: false,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error connecting to Supabase: ${error.message}`,
      mockMode: true,
      error
    };
  }
};

/**
 * Returns a string with instructions to configure the environment
 */
export const getSetupInstructions = () => {
  return `
# Environment Configuration

To connect the application to the Supabase database, follow these instructions:

1. Create a `.env.local` file in the project root with the following variables:

\`\`\`
VITE_SUPABASE_URL=https://afmktcwestdbkjealqbi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbWt0Y3dlc3RkYmtqZWFscWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MTUxMzIsImV4cCI6MjA2MzI5MTEzMn0.957BNYmqjfp1vNr8kkK2lLPbpQpGx-pji1zxWV6On-0
\`\`\`

2. Restart the development server:

\`\`\`
npm run dev
\`\`\`

3. Access the database configuration page at:
   http://localhost:5175/database-setup
`;
};
