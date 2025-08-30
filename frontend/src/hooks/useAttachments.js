import { useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadAPI } from '../services/api';

const ATTACHMENTS_QUERY_KEY = ['attachments'];

export const useAttachments = () => {
  return useQuery({
    queryKey: ATTACHMENTS_QUERY_KEY,
    queryFn: async () => {
      const response = await uploadAPI.getAll();
      return response.data?.data?.attachments || response.data?.attachments || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useInvalidateAttachments = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ATTACHMENTS_QUERY_KEY });
  };
};