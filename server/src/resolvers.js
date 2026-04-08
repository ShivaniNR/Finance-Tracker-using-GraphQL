const { GraphQLError } = require('graphql');
const {
  AddTransactionInput,
  UpdateTransactionInput,
  DeleteTransactionInput,
} = require('../services/validation');

const resolvers = {
  Query: {
    transactions: async (_, { limit = 50, offset = 0 }, { supabase }) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw new GraphQLError(error.message);

      return data.map(formatTransaction);
    },

    dashboard: async (_, __, { supabase }) => {
      const { data, error } = await supabase.rpc('get_dashboard_data');

      if (error) throw new GraphQLError(error.message);

      // Format recentTransactions to match Transaction type
      if (data.recentTransactions) {
        data.recentTransactions = data.recentTransactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          description: t.description,
          date: t.date,
          category: t.category,
          categoryIcon: t.icon,
          categoryColor: t.color,
        }));
      }

      return data;
    },

    transactionsByCategory: async (_, { category }, { supabase }) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .eq('categories.name', category)
        .order('date', { ascending: false });

      if (error) throw new GraphQLError(error.message);

      return data.map(formatTransaction);
    },

    searchTransactions: async (_, { query }, { supabase }) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .ilike('description', `%${query}%`)
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw new GraphQLError(error.message);

      return data.map(formatTransaction);
    },

    getUserCategories: async (_, __, { supabase }) => {
      const { data, error } = await supabase.rpc('get_user_categories');

      if (error) throw new GraphQLError(error.message);

      return data.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        isSystem: c.is_system,
        transactionCount: c.transaction_count,
      }));
    },
  },

  Mutation: {
    addTransaction: async (_, args, { supabase, userId }) => {
      // Validate input
      const validated = AddTransactionInput.parse({
        amount: args.amount,
        description: args.description,
        category: args.category,
        type: args.type,
        date: args.date,
      });

      // Look up category by name, or create it
      const categoryId = await resolveCategory(
        supabase,
        userId,
        validated.category,
        validated.type
      );

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: validated.amount,
          type: validated.type,
          description: validated.description,
          category_id: categoryId,
          date: validated.date || new Date().toISOString().split('T')[0],
        })
        .select('*, categories(name, icon, color)')
        .single();

      if (error) throw new GraphQLError(error.message);

      return formatTransaction(data);
    },

    updateTransaction: async (_, args, { supabase, userId }) => {
      // Validate input
      const validated = UpdateTransactionInput.parse(args);

      const updates = {};
      if (validated.amount !== undefined) updates.amount = validated.amount;
      if (validated.type !== undefined) updates.type = validated.type;
      if (validated.description !== undefined)
        updates.description = validated.description;
      if (validated.date !== undefined) updates.date = validated.date;

      // If category name provided, resolve to category_id
      if (validated.category !== undefined) {
        updates.category_id = await resolveCategory(
          supabase,
          userId,
          validated.category,
          validated.type || 'EXPENSE'
        );
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', validated.id)
        .select('*, categories(name, icon, color)')
        .single();

      if (error) throw new GraphQLError(error.message);

      return formatTransaction(data);
    },

    deleteTransaction: async (_, args, { supabase }) => {
      const validated = DeleteTransactionInput.parse(args);

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', validated.id);

      if (error) throw new GraphQLError(error.message);

      return true;
    },
  },
};

/**
 * Formats a Supabase transaction row (with joined category) into the GraphQL Transaction type.
 */
function formatTransaction(row) {
  return {
    id: row.id,
    amount: row.amount,
    type: row.type,
    description: row.description,
    date: row.date,
    category: row.categories?.name || 'Other',
    categoryIcon: row.categories?.icon || null,
    categoryColor: row.categories?.color || null,
  };
}

/**
 * Resolves a category name to its UUID.
 * If the category doesn't exist for this user, creates it.
 */
async function resolveCategory(supabase, userId, categoryName, type) {
  // Try to find existing category
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', categoryName)
    .limit(1)
    .single();

  if (existing) return existing.id;

  // Create new category
  const { data: created, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name: categoryName,
      type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    })
    .select('id')
    .single();

  if (error) throw new GraphQLError(`Failed to create category: ${error.message}`);

  return created.id;
}

module.exports = resolvers;
