import { supabase } from '../lib/supabase';

/**
 * Fetch all content nodes (courses and topics)
 * Returns the hierarchical structure
 */
export async function fetchContentNodes() {
  // Fetch courses (Level 1)
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('id, name')
    .order('created_at', { ascending: true });

  if (coursesError) throw coursesError;

  // Fetch content nodes (Level 2 & 3)
  const { data: nodesData, error: nodesError } = await supabase
    .from('content_nodes')
    .select('id, course_id, parent_id, title, type, content_eng, content_tel')
    .order('created_at', { ascending: true });

  if (nodesError) throw nodesError;

  const nodeMap = {};
  
  // Initialize courses into the map
  const tree = [];
  coursesData.forEach(course => {
    nodeMap[course.id] = { id: course.id, title: course.name, type: 'course', isCourse: true, children: [] };
    tree.push(nodeMap[course.id]); // Courses are the root level
  });

  // Initialize content nodes into the map
  nodesData.forEach(node => {
    nodeMap[node.id] = { ...node, children: [] };
  });

  // Build the tree connections
  nodesData.forEach(node => {
    if (node.parent_id && nodeMap[node.parent_id]) {
      // It's a Level 3 node (has a parent content_node)
      nodeMap[node.parent_id].children.push(nodeMap[node.id]);
    } else if (!node.parent_id && node.course_id && nodeMap[node.course_id]) {
      // It's a Level 2 node (has no parent_id, but belongs to a course)
      nodeMap[node.course_id].children.push(nodeMap[node.id]);
    } else {
      // Orphan or global node (no course, no parent)
      tree.push(nodeMap[node.id]);
    }
  });

  // Recursively sort the tree by title (natural sort for numbers like 01, 02)
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => {
      const titleA = (a.title || '').toLowerCase();
      const titleB = (b.title || '').toLowerCase();
      return titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' });
    });

    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(tree);

  return { courseTree: tree, allNodes: nodesData };
}

/**
 * Fetch a specific node's content
 */
export async function fetchNodeContent(id) {
  const { data, error } = await supabase
    .from('content_nodes')
    .select('id, title, content_eng, content_tel')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching node content:', error);
    throw error;
  }

  return data;
}

/**
 * Update the readme_content of a specific node
 */
export async function updateNodeContent(id, content, column = 'content_eng') {
  const updateData = { [column]: content };
  
  const { data, error } = await supabase
    .from('content_nodes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating node content:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new content node (folder or file)
 */
export async function createNode({ title, type, course_id, parent_id }) {
  // Generate a basic slug from the title
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  // Basic path generation (can be customized later)
  const path = `/${slug}`;

  // Insert the first row (English/Folder)
  const { data, error } = await supabase
    .from('content_nodes')
    .insert([{
      title,
      type,
      course_id,
      parent_id,
      slug,
      path,
      content_eng: type === 'file' ? '# ' + title : null,
      content_tel: null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating node:', error);
    throw error;
  }

  // If it's a file, insert a SECOND row for Telugu content as requested by user
  if (type === 'file') {
    const { error: telError } = await supabase
      .from('content_nodes')
      .insert([{
        title,
        type,
        course_id,
        parent_id,
        slug: `${slug}-tel`,
        path: `${path}-tel`,
        content_eng: null,
        content_tel: `# ${title} (Telugu)`
      }]);
      
    if (telError) {
      console.error('Error creating telugu node:', telError);
    }
  }

  return data;
}

/**
 * Delete a content node
 */
export async function deleteNode(id) {
  const { error } = await supabase
    .from('content_nodes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting node:', error);
    throw error;
  }
}
