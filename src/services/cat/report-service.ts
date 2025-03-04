
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const reportCat = async (catId: string, userId: string, reason: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('report-cat', {
      body: { catId, userId, reason }
    });
    
    if (error) {
      console.error('Error reporting cat:', error);
      throw new Error(error.message);
    }
    
    if (data.error) {
      console.error('Error in report-cat function:', data.error);
      throw new Error(data.error);
    }
    
    toast.success('Post reported successfully');
    
    if (data.reports_count >= 5) {
      toast.info('This post has been removed due to multiple reports');
    }
    
    return data;
  } catch (error) {
    console.error('Error in reportCat:', error);
    toast.error(error.message || 'Failed to report post');
    throw error;
  }
};
