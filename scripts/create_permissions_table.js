import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carrega as variu00e1veis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variu00e1veis de ambiente do Supabase nu00e3o encontradas');
  process.exit(1);
}

// Cria o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Lu00ea o arquivo SQL
const sqlFilePath = path.join(process.cwd(), 'migrations', 'create_user_permissions_table.sql');
const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

async function createPermissionsTable() {
  try {
    console.log('Executando migrau00e7u00e3o para criar a tabela user_permissions...');
    
    // Executa o SQL no Supabase
    const { error } = await supabase.rpc('exec_sql', { query: sqlQuery });
    
    if (error) {
      console.error('Erro ao executar a migrau00e7u00e3o:', error);
      return;
    }
    
    console.log('Tabela user_permissions criada com sucesso!');
    
    // Cria permissu00f5es padru00e3o para usuu00e1rios existentes
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');
    
    if (usersError) {
      console.error('Erro ao buscar usuu00e1rios:', usersError);
      return;
    }
    
    console.log(`Criando permissu00f5es padru00e3o para ${users.length} usuu00e1rios...`);
    
    // Para cada usuu00e1rio, cria um registro de permissu00e3o padru00e3o
    for (const user of users) {
      const { error: insertError } = await supabase
        .from('user_permissions')
        .insert({
          user_id: user.id,
          project_ids: [],
          task_ids: [],
          calendar_access: false,
          tracking_access: false
        });
      
      if (insertError) {
        console.error(`Erro ao criar permissu00f5es para o usuu00e1rio ${user.id}:`, insertError);
      }
    }
    
    console.log('Migrau00e7u00e3o concluu00edda com sucesso!');
  } catch (error) {
    console.error('Erro ao executar a migrau00e7u00e3o:', error);
  }
}

createPermissionsTable();
