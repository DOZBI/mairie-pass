-- Create enum for document types
CREATE TYPE public.document_type AS ENUM (
  'birth_certificate_extract', 
  'birth_certificate_full', 
  'criminal_record'
);

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM (
  'pending',
  'in_review', 
  'approved',
  'rejected',
  'completed'
);

-- Create document_requests table
CREATE TABLE public.document_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type document_type NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  additional_info JSONB,
  admin_notes TEXT,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own requests" 
ON public.document_requests 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own requests" 
ON public.document_requests 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending requests" 
ON public.document_requests 
FOR UPDATE 
USING (user_id = auth.uid() AND status = 'pending');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_document_requests_updated_at
BEFORE UPDATE ON public.document_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();