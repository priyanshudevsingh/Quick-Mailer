import { useQuery, useQueryClient } from '@tanstack/react-query';
import { templatesAPI } from '../services/api';

const TEMPLATES_QUERY_KEY = ['templates'];

export const useTemplates = (search = '') => {
  return useQuery({
    queryKey: [...TEMPLATES_QUERY_KEY, search],
    queryFn: async () => {
      const response = await templatesAPI.getAll();
      const templates = response.data?.data?.templates || response.data?.templates || [];
      
      // Filter by search if provided
      if (search) {
        return templates.filter(template => 
          template.name.toLowerCase().includes(search.toLowerCase()) ||
          template.subject.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return templates;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useInvalidateTemplates = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
  };
};