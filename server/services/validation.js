const { z } = require('zod');

const AddTransactionInput = z.object({
  amount: z.number().positive('Amount must be positive').max(99999999.99, 'Amount too large'),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Description required').max(500).trim(),
  category: z.string().min(1, 'Category required').max(100).trim(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
});

const UpdateTransactionInput = z.object({
  id: z.string().uuid('Invalid transaction ID'),
  amount: z.number().positive().max(99999999.99).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  description: z.string().min(1).max(500).trim().optional(),
  category: z.string().min(1).max(100).trim().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const DeleteTransactionInput = z.object({
  id: z.string().uuid('Invalid transaction ID'),
});

module.exports = {
  AddTransactionInput,
  UpdateTransactionInput,
  DeleteTransactionInput,
};
