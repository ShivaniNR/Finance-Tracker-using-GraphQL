import { useQuery } from '@apollo/client';
import { GET_TRANSACTIONS } from '../graphql/finance-tracker';

export function useTransactions(userId, startDate, endDate) {
  return useQuery(GET_TRANSACTIONS, {
    variables: { userId, startDate, endDate },
  });
}