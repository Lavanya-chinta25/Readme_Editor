import { createClient } from '@supabase/supabase-js';
// No dotenv, use --env-file

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Fetching courses...');
  const { data: courses, error: err1 } = await supabase.from('courses').select('*');
  if (err1) {
    console.log('Error fetching courses:', err1.message);
  } else {
    console.log('Courses:', courses.length);
    if (courses.length > 0) {
      console.log('Course columns:', Object.keys(courses[0]));
    }
  }

  console.log('Fetching schema of content_nodes...');
  const { data, error } = await supabase.from('content_nodes').select('*').limit(1);
  if (error) {
    console.log('Error fetching nodes:', error.message);
  } else if (data.length > 0) {
    console.log('content_nodes columns:', Object.keys(data[0]));
  }

  console.log('Fetching content_nodes...');
  const { data: nodes, error: err3 } = await supabase.from('content_nodes').select('id, course_id, parent_id, title');
  if (err3) {
    console.log('Error fetching nodes:', err3.message);
  } else {
    console.log('Content Nodes:', nodes.length);
    
    // Analyze levels
    const level1Nodes = nodes.filter(n => !n.parent_id);
    console.log('Nodes with NO parent_id:', level1Nodes.length);
    
    const level2Nodes = nodes.filter(n => n.parent_id && level1Nodes.find(l1 => l1.id === n.parent_id));
    console.log('Nodes pointing to level 1:', level2Nodes.length);
    
    const level3Nodes = nodes.filter(n => n.parent_id && level2Nodes.find(l2 => l2.id === n.parent_id));
    console.log('Nodes pointing to level 2:', level3Nodes.length);
  }
}

test();
