import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const useCompanyName = (userId: string | undefined | null) => {
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (!userId) {
        setCompanyName(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch company ID from companyuser table
        const { data: companyUser, error: companyUserError } = await supabase
          .from('companyuser')
          .select('companyid')
          .eq('uid', userId)
          .single();

        if (companyUserError) {
          throw companyUserError;
        }

        if (companyUser) {
          // Fetch company name from companies table
          const { data: company, error: companyError } = await supabase
            .from('company')
            .select('companyname')
            .eq('companyid', companyUser.companyid)
            .single();

          if (companyError) {
            throw companyError;
          }

          if (company) {
            setCompanyName(company.companyname);
          } else {
            setCompanyName(null);
          }
        } else {
          setCompanyName(null);
        }
      } catch (err: any) {
        setError(err);
        setCompanyName(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyName();
  }, [userId]);

  return { companyName, isLoading, error };
};

export default useCompanyName;
